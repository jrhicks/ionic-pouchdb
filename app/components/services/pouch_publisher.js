'use strict';

angular.module('app.pouch_publisher', [])
    .service('PouchPublisher', function(Pouch, $rootScope) {
        return {

            in_progress: false,

            cancel: function() {
                if(this.changes != undefined) {
                    if(this.changes.cancel != undefined)
                    {
                        this.changes.cancel();
                    }
                }
            },

            use: function(f) {
                // Cancel previous publishers from other controllers
                // Run the function immediately and then again on database changes
                // Prevent from getting called while in progress

                var self = this;
                self.in_progress = false;

                var runFn = function(info) {
                    if (self.in_progress === false) {
                        self.in_progress = true;
                        f().then(function() {
                            self.in_progress=false;
                            $rootScope.$apply();
                        });
                    }
                }

                runFn();

                Pouch.db.info(function(err, info) {
                    self.cancel();
                    self.changes = Pouch.db.changes({
                        since: info.update_seq,
                        live: true
                    }).on('change', runFn);
                });
            }

        }
    });

