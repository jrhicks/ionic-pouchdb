'use strict';
angular.module('app.db', [])

    .factory('db', function(pouchdb) {
        var db = pouchdb.create('localdb');
        return db;
    });

