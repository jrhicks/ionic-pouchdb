'use strict';

// To use this service in the console
// ps = angular.element(document.body).injector().get("PouchSync")

angular.module('app.pouch_sync', [])
    .service('PouchSync', function(Pouch, Account) {
        return {
            remotedb: '',
            replication_to_remote: undefined,
            replication_from_remote: undefined,

            disconnect: function() {
                var self = this;
                if(self.replication_to_remote != undefined) {
                    if(self.replication_to_remote.cancel != undefined)
                    {
                        self.replication_to_remote.cancel();
                    }
                }

                if(self.replication_from_remote != undefined) {
                    if(self.replication_from_remote.cancel != undefined)
                    {
                        self.replication_from_remote.cancel();
                    }
                }
            },

            connect: function() {
                this.disconnect();
                this.remotedb = new PouchDB(Account.database);
                this.replication_to_remote = Pouch.replicate.to(this.remotedb, {live: true});
                this.replication_from_remote = Pouch.replicate.from(this.remotedb, {live: true});
            },

            sync: function() {
                this.disconnect();
                this.remotedb = new PouchDB(Account.database);
                this.replication_to_remote = Pouch.replicate.to(this.remotedb, {live: true});
                this.replication_from_remote = Pouch.replicate.from(this.remotedb, {live: true});
            },

            isConnected: function() {
                var self = this;
                if (typeof self.replication_to_remote === "undefined") {
                    return false;
                }
                if (typeof self.replication_from_remote === "undefined") {
                    return false;
                }
                if (self.replication_to_remote.cancelled) {
                    return false;
                }
                if (self.replication_from_remote.cancelled) {
                    return false;
                }
                return true;
            }
        }
    });

