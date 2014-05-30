'use strict';

angular.module('app.todo', [])
    .service('Todo', function(Pouch, rfc4122) {

        return {
            add: function(obj) {
                obj._id = 'todo_'+rfc4122.v4();
                obj.doc_type = 'todo';
                obj.created_at = new Date();
                return Pouch.put(obj);
            },

            all: function() {
                var allTodos = function(doc) {
                    if (doc.doc_type === 'todo') {
                        emit(doc.created_at, doc._id);
                    }
                }
                return Pouch.query(allTodos, {descending: true, include_docs : true});
            }
        };
    });