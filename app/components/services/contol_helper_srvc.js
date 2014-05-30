'use strict';
angular.module('app.control_helper_srvc', [])
    .service('controlHelper', function(pouch) {
        return {
            cancel: function() {
                if(this.changes != undefined) {
                    if(this.changes.cancel != undefined)
                    {
                        this.changes.cancel();
                    }
                }
            },

            run: function(f) {
                // Run the function immediately and on database change
                var controlHelper = this;
                f();
                pouch.db.info(function(err, info) {
                    controlHelper.cancel();
                    controlHelper.changes = pouch.db.changes({
                        since: info.update_seq,
                        live: true
                    }).on('change', f);
                });
            },

        }
    });

