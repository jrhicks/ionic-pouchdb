'use strict';
angular.module('app.pouch_db_srvc', [])
    .service('pouch', function() {
        return {
            db: new PouchDB("mylocalstore"),
            remotedb: '',
            replicate_to: '',
            replicate_from: '',

            connect: function() {
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

