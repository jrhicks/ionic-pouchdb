'use strict';

angular.module('app.ar_dev', [])
    .service('ArDev', function(Pouch, rfc4122, $rootScope) {

        // Setup Indexes

        // document that tells PouchDB/CouchDB
        // to build up an index on doc.name
        var arDevs = {
            _id: '_design/allDevs',
            views: {
                'allDevs': {
                    map: function(doc) {
                        if (doc.doc_type === 'ar_dev') {
                            emit(doc.created_at, doc._id);
                        }
                    }.toString()
                }
            }
        };

        // save it
        Pouch.db.put(arDevs);

        return {
            add: function(obj) {
                alert("Saved 1");
                obj._id = 'ar_dev_'+rfc4122.v4();
                alert("Saved 1.2");
                obj.doc_type = 'ar_dev';
                obj.created_at = new Date();
                alert("Saved 2");
                alert("Saved 3");
                return Pouch.db.put(obj);
            },

            all: function() {
                var allDevs = function(doc) {
                    if (doc.doc_type === 'ar_dev') {
                        emit(doc.created_at, doc._id);
                    }
                }
                return Pouch.db.query(allDevs, {descending: true, include_docs : true});
            }
        };
    });