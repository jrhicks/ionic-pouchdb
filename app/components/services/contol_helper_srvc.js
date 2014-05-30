'use strict';
angular.module('app.control_helper_srvc', [])
    .service('controlHelper', function(pouch) {
        return {
            run_listener: '',

            run: function(f) {
                // Run the function immediately and on database change
                f();
                var that = this;
                pouch.db.info(function(err, info) {
                    that.run_listener = pouch.db.changes({
                        since: info.update_seq,
                        live: true
                    }).on('change', f);
                });
            },

        }
    });

