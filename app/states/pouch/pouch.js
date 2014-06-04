'use strict';

angular.module('app.pouch', [])
    .service('Pouch', function($rootScope, $timeout, $interval,  $localStorage) {

        var service =  {
            // Databases
            db: new PouchDB("LocalDB"),
            remotedb: undefined,

            // Persistent Settings
            settings: {
                database: undefined,
                username: undefined,
                password: undefined,
                stayConnected: undefined
            },

            // Persistent Status
            status: {
                localChanges: 0,
                lastChanges: {},
                lastReplicationTo: {},
                lastReplicationFrom: {}
            },

            // Session Status
            session: {
                // Session Stats
                status: "offline",
                docsSent: 0,
                docsReceived: 0,
                // Session Promises & Even Emitters
                changes: undefined,
                replicationTo: undefined,
                replicationFrom: undefined,
                delayStatusPromise: undefined
            },

            /*
             *  Initializers
             *
             */

            init: function() {
                // Load Persistent Data
                this.loadSettings();
                this.loadStatus();

                // Start Session
                this.trackChanges();
            },


            /*
             *  $localStorage aware accessors for settings and status
             */

            incrementLocalChanges: function() {
                this.status.localChanges++;
                this.persistStatus();
            },

            resetLocalChanges: function() {
                this.status.localChanges = 0;
                this.persistStatus();
            },

            setLastChanges: function(value) {
                this.status.lastChanges = value;
                this.persistStatus();
            },

            setLastReplicationTo: function(value) {
                this.status.lastReplicationTo = value;
                this.persistStatus();
            },

            setLastReplicationFrom: function(value) {
                this.status.lastReplicationFrom = value;
                this.persistStatus();
            },

            persistStatus: function() {
                $localStorage.pouchStatus = this.status;
            },

            loadSettings: function() {
                this.settings = $localStorage.pouchSettings;
            },

            loadStatus: function() {
                this.status = $localStorage.pouchStatus;
            },

            /*
             *  Public Methods
             */

            getSettings: function() {
                return this.settings;
            },

            getStatus: function() {
                return this.status;
            },

            getSession: function() {
                return this.session;
            },

            saveSettings: function(settings) {
                this.settings = settings;
                $localStorage.pouchSettings = settings;

            },

            statusIcon: function() {
                switch(this.session.status) {
                    case "online":
                        return "ion-ios7-cloud-outline";
                    case "offline":
                        return "ion-ios7-cloudy-night-outline";
                    case "idle":
                        return "ion-ios7-cloud-outline";
                    case "receiving":
                        return "ion-ios7-cloud-download-outline";
                    case "sending":
                        return "ion-ios7-cloud-upload-outline";
                    default:
                        return "ion-alert-circled";
                }
            },

            statusTitle: function() {
                switch(this.session.status) {
                    case "online":
                        return "Connected";
                    case "offline":
                        return "Disconnected";
                    case "idle":
                        return "Connected";
                    case "receiving":
                        return "Receiving Data";
                    case "sending":
                        return "Sending Data";
                    default:
                        return "Unknown Status";
                }
            },

            // Destroy and recreated local db and changes db
            reset: function() {
                var self = this;
                var p1 = PouchDB.destroy("LocalDB").then( function() {
                    $localStorage.pouchStatus = {};
                    $localStorage.session = {};
                    self.disconnect();
                    self.init();
                });
            },

            /*
             *  Private Methods
             */

            setSessionStatus: function(status) {
              this.session.status = status;
              this.cancelSessionStatus();
              $rootScope.$digest();
            },

            delaySessionStatus: function(delay, status) {
                var self = this;
                self.session.delayStatusPromise = $timeout(
                    function() {
                          self.setSessionStatus(status);
                         },delay);
            },

            cancelSessionStatus: function() {
                var self = this;
                if(typeof self.session.delayStatusPromise === "Promise")
                {
                    self.session.delayStatusPromise.cancel();
                }
            },

            trackChanges: function() {
                var self = this;
                if (typeof self.session.changes === "Promise") {
                    self.session.changes.cancel();
                }
                self.db.info(function(err, info) {
                    self.session.changes = self.db.changes({
                        since: info.update_seq,
                        live: true
                    })
                        .on('change', function(info) {self.handleChanges(info, "change")} )
                        .on('error', function(info) {self.handleChanges(info, "error")})
                        .on('complete', function(info) {self.handleChanges(info, "complete")})
                });
            },

            createRemoteDb: function() {
                var self = this;
                if (typeof self.settings.database === "String")
                {
                    self.remotedb = new PouchDB(this.settings.database);
                }
            },

            handleChanges: function(info, event) {
                var self = this;
                info.event = event;
                info.occurred_at = new Date();
                self.setLastChanges(info);
                if (event === "change") {
                    self.incrementLocalChanges();
                    $rootScope.$apply();
                }

            },

            handleReplicationFrom: function(info, event) {
                var self = this;
                info.event = event;
                info.occurred_at = new Date();
                self.setLastReplicationFrom(info);
                switch (event) {
                    case "uptodate":
                        self.delayStatus(800, "idle");
                        break;
                    case "error":
                        self.delayStatus(800, "offline");
                        break;
                    case "complete":
                        self.delayStatus(800, "offline");
                        break;
                    case "change":
                        if(info.docs_written > self.docsReceived){
                            self.docsReceived = info.docs_written;
                            self.setSessionStatus("receiving");
                        }
                        break
                    }
                $rootScope.$apply();
            },

            handleReplicationTo: function(info, event) {
                var self = this;
                info.event = event;
                switch (event) {
                    case "uptodate":
                        self.resetLocalChanges();
                        self.delayStatus(800, "idle");
                        break;
                    case "error":
                        self.delayStatus(800, "offline");
                        break;
                    case "complete":
                        self.delayStatus(800, "offline");
                        break;
                    case "change":
                        if(info.docs_written > self.docsSent){
                            self.docsSent = info.docs_written;
                            self.setSessionStatus("sending");
                        }
                        break
                }
                info.occurred_at = new Date();
                this.setLastReplicationTo(info);
                $rootScope.$apply();
            },


            // Disconnect from Remote Database
            disconnect: function() {
                var self = this;
                if(typeof self.session.replicationTo === "Promise") {
                    self.session.replicationTo.cancel();
                }

                if(typeof self.session.replicationFrom === "Promise") {
                        self.session.replicationFrom.cancel();
                }
            },

            // Connect to Remote Database and Start Replication
            connect: function() {
                var self = this;
                self.session.docsSent = 0;
                self.session.docsReceived = 0;
                this.disconnect();
                this.createRemoteDb();
                this.session.replicationTo = this.db.replicate.to(this.remotedb, {live: true})
                    .on('change', function(info)   {p.handleReplicationTo(info, "change")})
                    .on('uptodate', function(info) {p.handleReplicationTo(info, "uptodate")})
                    .on('error', function(info)    {p.handleReplicationTo(info, "error")})
                    .on('complete', function(info) {p.handleReplicationTo(info, "complete")});

                this.session.replicationFrom = this.db.replicate.from(this.remotedb, {live: true})
                    .on('change', function(info)   {p.handleReplicationFrom(info, "change")})
                    .on('uptodate', function(info) {p.handleReplicationFrom(info, "uptodate")})
                    .on('error', function(info)    {p.handleReplicationFrom(info, "error")})
                    .on('complete', function(info) {p.handleReplicationFrom(info, "complete")});
            },


            // Test if connection is still working
            isConnected: function() {
                var self = this;
                if (typeof self.session.replicationTo === "undefined") {
                    return false;
                }
                if (typeof self.session.replicationFrom === "undefined") {
                    return false;
                }
                if (self.session.replicationTo.cancelled) {
                    return false;
                }
                if (self.session.replicationFrom.cancelled) {
                    return false;
                }
                return true;
            }
        };

        service.init();
        return service
    });

