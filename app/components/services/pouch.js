'use strict';

// https://github.com/chesles/timepouch/blob/master/timepouch.js

// To use this service in the console
// ps = angular.element(document.body).injector().get("PouchSync")
// p = angular.element(document.body).injector().get("Pouch")
// p.replicate.to("http://localhost:5984/jrhicks").then( f )


angular.module('app.pouch', [])
    .service('Pouch', function(Account, rfc4122, $q) {

        var p =  {
            db: new PouchDB("LocalDB"),
            changesdb: new PouchDB("ChangesDB"),
            remotedb: undefined,

            logEvent: function(info, event, db) {
                console.log("logChange");
                info._id = info.seq + '_' + rfc4122.v4();
                info.db = db;
                info.event = event;
                info.created_at = new Date();
                this.changesdb.put( info );
            },

            replication_to: undefined,
            replication_from: undefined,

            // Destroy and recreated local db and changes db
            reset: function() {
                var self = this;
                var p1 = PouchDB.destroy("LocalDB")
                var p2 = PouchDB.destroy("ChangesDB");

                $q.all(p1,p2).then( function () {
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
                this.remotedb = new PouchDB(Account.database);
                this.replication_to = this.db.replicate.to(this.remotedb, {live: true})
                    .on('change', function(info) {p.logEvent(info, "change", "replication_to")})
                    .on('uptodate', function(info) {p.logEvent(info, "uptodate", "replication_to")})
                    .on('error', function(info) {p.logEvent(info, "error", "replication_to")})
                    .on('complete', function(info) {p.logEvent(info, "complete", "replication_to")});

                this.replication_from = this.db.replicate.from(this.remotedb, {live: true})
                    .on('change', function(info) {p.logEvent(info, "change", "replication_from")})
                    .on('uptodate', function(info) {p.logEvent(info, "uptodate", "replication_from")})
                    .on('error', function(info) {p.logEvent(info, "error", "replication_from")})
                    .on('complete', function(info) {p.logEvent(info, "complete", "replication_from")});
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
        }

        p.db.info(function(err, info) {
            p.changes = p.db.changes({
                since: info.update_seq,
                live: true
            })
                .on('change', function(info) {p.logEvent(info, "change", "LocalDB")} )
                .on('error', function(info) {p.logEvent(info, "error", "LocalDB")})
                .on('complete', function(info) {p.logEvent(info, "complete", "LocalDB")})
        });



        return p
    });

