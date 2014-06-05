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
                changeEvents: {},
                replicationToEvents: {},
                replicationFromEvents: {}
            },

            // Session Status
            session: {
                // Session Stats
                status: "offline",
                docsSent: 0,
                docsReceived: 0,
                currentRetryDelay: 10,
                maxRetryDelay: 60*1000*10,
                retryDelayInc: 1000,
                lastConnectionAttempt: undefined
            },

            // SPromises & Even Emitters
            changes: undefined,
            replicationTo: undefined,
            replicationFrom: undefined,
            delayStatusPromise: undefined,
            retryPromise: undefined,

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
                this.initRobustSync();
            },


            /*
             *  $localStorage aware accessors for settings and status
             */

            incrementLocalChanges: function() {
                if( typeof this.statusLocalChanges === "Integer")
                {
                    this.status.localChanges++;
                } else {
                    this.status.localChanges = 1;
                }


                this.persistStatus();
            },

            resetLocalChanges: function() {
                this.status.localChanges = 0;
                this.persistStatus();
            },

            storeChangeEvent: function(value, event) {
                var self = this;
                if( typeof self.status.changeEvents === "undefined")
                {
                    self.status.changeEvents = {}
                }
                self.status.changeEvents[event] = value;
                self.persistStatus();
            },

            storeReplicationToEvent: function(value, event) {
                var self = this;
                if( typeof self.status.replicationToEvents === "undefined")
                {
                    self.status.replicationToEvents = {}
                }

                self.status.replicationToEvents[event] = value;
                self.persistStatus();
            },

            storeReplicationFromEvent: function(value, event) {
                var self = this;
                if( typeof self.status.replicationFromEvents === "undefined")
                {
                    self.status.replicationFromEvents = {}
                }
                self.status.replicationFromEvents[event] = value;
                self.persistStatus();
            },

            persistStatus: function() {
                $localStorage.pouchStatus = this.status;
            },

            loadSettings: function() {
                if (typeof $localStorage.pouchSettings !== undefined) {
                    this.settings = $localStorage.pouchSettings
                }
            },

            loadStatus: function() {
                if (typeof $localStorage.pouchStatus !== undefined) {
                    this.status = $localStorage.pouchStatus
                }
            },

            /*
             *  Public Methods
             */

            getSettings: function() {
                return this.settings;
            },

            saveSettings: function(settings) {
                this.settings = settings;
                $localStorage.pouchSettings = settings;

            },

            localChanges: function() {
                return this.status.localChanges;
            },

            attemptConnection: function() {
                var self = this;
                self.session.lastConnectionAttempt = new Date();
                self.flashSessionStatus("connecting");
                self.connect();
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
                    case "connecting":
                        return "Trying to connect"
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


            initRobustSync: function() {
              var self = this;
              if (self.settings.stayConnected === true) {
                self.progressiveRetry();
              }
            },

            cancelProgressiveRetry: function() {
              var self = this;
              if (typeof self.retryPromise === "object") {
                  $interval.cancel( self.retryPromose );
              }
            },

            progressiveRetry: function() {
                var self = this;
                if (self.session.currentRetryDelay < self.session.maxRetryDelay)
                {
                    self.session.currentRetryDelay = self.sessionRetryDelay + self.session.retryDelayInc;
                }

                self.retryPromise = $interval( function() {
                    self.attemptConnection()
                    }, self.session.currentRetryDelay, 1, false)
                        .then(function(){},
                              function(){self.progressiveRetry()})
            },

            flashSessionStatus: function(status) {
                var self = this;
                var s = self.session.status;
                this.setSessionStatus(status);
                this.delaySessionStatus(s);
                $rootScope.$digest();
            },

            setSessionStatus: function(status) {
              this.cancelSessionStatus();
              this.session.status = status;
              $rootScope.$digest();
            },

            delaySessionStatus: function(delay, status) {
                var self = this;
                self.delayStatusPromise= $timeout(
                    function() {
                          self.setSessionStatus(status);
                         },delay);
            },

            cancelSessionStatus: function() {
                var self = this;
                if(typeof delayStatusPromise=== "object")
                {
                    self.delayStatusPromise.cancel();
                }
            },

            trackChanges: function() {
                console.log("track changes");
                var self = this;
                if (typeof self.changes === "object") {
                    self.changes.cancel();
                }
                self.db.info()
                    .then( function(info) {
                        self.changes = self.db.changes({
                            since: info.update_seq,
                            live: true
                        })
                            .on('change', function(info) {self.handleChanges(info, "change")} )
                            .on('error', function(info) {self.handleChanges(info, "error")})
                            .on('complete', function(info) {self.handleChanges(info, "complete")})
                });

            },

            handleChanges: function(info, event) {
                console.log("handleChanges");
                var self = this;
                info.occurred_at = new Date();
                self.storeChangeEvent(info, event);
                if (event === "change") {
                    self.incrementLocalChanges();
                    $rootScope.$apply();
                }

            },

            handleReplicationFrom: function(info, event) {
                console.log("handleReplicationFrom");
                var self = this;
                info.occurred_at = new Date();
                self.storeReplicationFromEvent(info, event);
                switch (event) {
                    case "uptodate":
                        self.delaySessionStatus(800, "idle");
                        break;
                    case "error":
                        self.delaySessionStatus(800, "offline");
                        break;
                    case "complete":
                        self.delaySessionStatus(800, "offline");
                        break;
                    case "change":
                        if(info.docs_written > self.session.docsReceived){
                            self.session.docsReceived = info.docs_written;
                            self.setSessionStatus("receiving");
                        }
                        break
                    }
                $rootScope.$apply();
            },

            handleReplicationTo: function(info, event) {
                console.log("handleReplicationTo");
                var self = this;
                switch (event) {
                    case "uptodate":
                        self.resetLocalChanges();
                        self.delaySessionStatus(800, "idle");
                        break;
                    case "error":
                        self.delaySessionStatus(800, "offline");
                        break;
                    case "complete":
                        self.delaySessionStatus(800, "offline");
                        break;
                    case "change":
                        if(info.docs_written > self.session.docsSent){
                            self.session.docsSent = info.docs_written;
                            self.setSessionStatus("sending");
                        }
                        break
                }
                info.occurred_at = new Date();
                this.storeReplicationToEvent(info, event);
                $rootScope.$apply();
            },


            // Disconnect from Remote Database
            disconnect: function() {
                var self = this;
                if(typeof self.replicationTo === "object") {
                    self.replicationTo.cancel();
                }

                if(typeof self.replicationFrom === "object") {
                        self.replicationFrom.cancel();
                }
            },

            createRemoteDb: function() {
                var self = this;
                if (typeof self.settings.database === "string")
                {
                    self.remotedb = new PouchDB(this.settings.database);
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
                    .on('change', function(info)   {self.handleReplicationTo(info, "change")})
                    .on('uptodate', function(info) {self.handleReplicationTo(info, "uptodate")})
                    .on('error', function(info)    {self.handleReplicationTo(info, "error")})
                    .on('complete', function(info) {self.handleReplicationTo(info, "complete")});

                this.session.replicationFrom = this.db.replicate.from(this.remotedb, {live: true})
                    .on('change', function(info)   {self.handleReplicationFrom(info, "change")})
                    .on('uptodate', function(info) {self.handleReplicationFrom(info, "uptodate")})
                    .on('error', function(info)    {self.handleReplicationFrom(info, "error")})
                    .on('complete', function(info) {self.handleReplicationFrom(info, "complete")});
            },


            // Test if connection is still working
            isConnected: function() {
                var self = this;
                if (typeof self.replicationTo === "undefined") {
                    return false;
                }
                if (typeof self.replicationFrom === "undefined") {
                    return false;
                }
                if (self.replicationTo.cancelled) {
                    return false;
                }
                if (self.replicationFrom.cancelled) {
                    return false;
                }
                return true;
            }
        };

        service.init();
        return service
    });

