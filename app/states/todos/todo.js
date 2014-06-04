'use strict';

angular.module('app.todo', [])
    .service('Todo', function(Pouch, rfc4122, $rootScope) {

        // Setup Indexes

        // document that tells PouchDB/CouchDB
        // to build up an index on doc.name
        var recentTodos = {
            _id: '_design/recentTodos',
            views: {
                'recentTodos': {
                    map: function(doc) {
                        if (doc.doc_type === 'todo') {
                            emit(doc.created_at, doc._id);
                        }
                    }.toString()
                }
            }
        };

        // save it
        Pouch.db.put(recentTodos);

        return {
            add: function(obj) {
                obj._id = 'todo_'+rfc4122.v4();
                obj.doc_type = 'todo';
                obj.created_at = new Date();
                return Pouch.db.put(obj);
            },

            all: function() {
                var allTodos = function(doc) {
                    if (doc.doc_type === 'todo') {
                        emit(doc.created_at, doc._id);
                    }
                }
                return Pouch.db.query(allTodos, {descending: true, include_docs : true});
            }
        };
    });