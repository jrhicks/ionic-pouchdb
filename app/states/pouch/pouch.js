'use strict';

// https://github.com/chesles/timepouch/blob/master/timepouch.js

// To use this service in the console
// ps = angular.element(document.body).injector().get("PouchSync")
// p = angular.element(document.body).injector().get("Pouch")
// p.replicate.to("http://localhost:5984/jrhicks").then( f )


angular.module('app.pouch', [])
    .service('Pouch', function(rfc4122, $localStorage, $q, $rootScope) {

        if (typeof $localStorage.pouchSyncInfo === "undefined") {
            $localStorage.pouchSyncInfo = {
                local_changes: 0,
                last_changes: {},
                last_replication_to: {},
                last_replication_from: {},
                connected: false,
                online: false
            }
        }

        var localdb = new PouchDB("LocalDB");
        var remotedb = undefined;

        if (typeof $localStorage.pouchRemoteAccount !== "undefined") {
            remotedb = new PouchDB($localStorage.pouchRemoteAccount.database);
        }

        var p =  {
            db: localdb,
            remotedb: remotedb,

            // returns account data
            // {
            //    database: 'http://localhost:5984/dbname',
            //    username: 'foo',
            //    password: 'bar',
            //    stayConnected: true
            // };
            getRemoteAccount: function() {
                return $localStorage.pouchRemoteAccount;
            },

            // sets account data
            // {
            //    database: 'http://localhost:5984/dbname',
            //    username: 'foo',
            //    password: 'bar',
            //    stayConnected: true
            // };
            setRemoteAccount: function(account) {
                $localStorage.pouchRemoteAccount = account;
            },

            getInfo: function() {
                return $localStorage.pouchSyncInfo;
            },

            openRemoteAccount: function() {
                var self=this;
                if (typeof $localStorage.pouchRemoteAccount !== "undefined") {
                    self.remotedb = new PouchDB($localStorage.pouchRemoteAccount.database);
                }
            },

            logChanges: function(info, event) {
                info.event = event;
                info.occurred_at = new Date();
                if (event === "change") {
                    $localStorage.pouchSyncInfo.local_changes = $localStorage.pouchSyncInfo.local_changes+ 1;
                    $rootScope.$apply();
                }
                $localStorage.pouchSyncInfo.last_changes = info;

            },

            logReplicationFrom: function(info, event) {
                info.event = event;
                info.occurred_at = new Date();
                $localStorage.pouchSyncInfo.last_replication_from = info;
                //$rootScope.$apply();
            },

            logReplicationTo: function(info, event) {
                info.event = event;
                if (event === "uptodate") {
                    $localStorage.pouchSyncInfo.local_changes = 0;
                    $rootScope.$apply();
                }
                info.occurred_at = new Date();
                $localStorage.pouchSyncInfo.last_replication_to = info;
                //$rootScope.$apply();
            },

            replication_to: undefined,
            replication_from: undefined,

            // Destroy and recreated local db and changes db
            reset: function() {
                var self = this;

                var p1 = PouchDB.destroy("LocalDB");
                var p2 = PouchDB.destroy("ChangesDB");

                return $q.all(p1,p2).then( function () {
                    $localStorage.pouchSyncInfo = {
                        local_changes: 0,
                        last_changes: {},
                        last_replication_to: {},
                        last_replication_from: {},
                        connected: false,
                        online: false
                    };
                    self.db = new PouchDB("LocalDB");
                    self.changesdb = new PouchDB("ChangesDB");
                });
            },

            // Disconnect from Remote Database
            disconnect: function() {
                var self = this;
                if(self.replication_to != undefined) {
                    if(self.replication_to.cancel != undefined)
                    {
                        self.replication_to.cancel();
                    }
                }

                if(self.replication_from != undefined) {
                    if(self.replication_from.cancel != undefined)
                    {
                        self.replication_from.cancel();
                    }
                }
            },

            // Connect to Remote Database and Start Replication
            connect: function() {
                this.disconnect();
                this.openRemoteAccount();
                this.replication_to = this.db.replicate.to(this.remotedb, {live: true})
                    .on('change', function(info)   {p.logReplicationTo(info, "change")})
                    .on('uptodate', function(info) {p.logReplicationTo(info, "uptodate")})
                    .on('error', function(info)    {p.logReplicationTo(info, "error")})
                    .on('complete', function(info) {p.logReplicationTo(info, "complete")});

                this.replication_from = this.db.replicate.from(this.remotedb, {live: true})
                    .on('change', function(info)   {p.logReplicationFrom(info, "change")})
                    .on('uptodate', function(info) {p.logReplicationFrom(info, "uptodate")})
                    .on('error', function(info)    {p.logReplicationFrom(info, "error")})
                    .on('complete', function(info) {p.logReplicationFrom(info, "complete")});
            },


            // Test if connection is still working
            isConnected: function() {
                var self = this;
                if (typeof self.replication_to === "undefined") {
                    return false;
                }
                if (typeof self.replication_from === "undefined") {
                    return false;
                }
                if (self.replication_to.cancelled) {
                    return false;
                }
                if (self.replication_from.cancelled) {
                    return false;
                }
                return true;
            }
        };


        p.db.info(function(err, info) {
            p.changes = p.db.changes({
                since: info.update_seq,
                live: true
            })
                .on('change', function(info) {p.logChanges(info, "change")} )
                .on('error', function(info) {p.logChanges(info, "error")})
                .on('complete', function(info) {p.logChanges(info, "complete")})
        });



        return p
    });

