'use strict';

angular.module('app.pouch_sync', [])
    .service('PouchSync', function() {
        return {
            remotedb: '',
            replicate_to: '',
            replicate_from: '',

            connect: function(username, password) {
                this.remotedb = new PouchDB("http://localhost:5984/anton");
                this.replicate_to = this.db.replicate.to(this.remotedb, {live: true}).on('error', function() {
                    alert(err);
                });
                this.replicate_from = this.db.replicate.from(this.remotedb, {live: true}).on('error', function(err) {
                    alert(err);
                });
            }
        }
    });

