'use strict';
angular.module('app.db', [])

    .factory('db', function(pouchdb) {
        var db = pouchdb.create('mydb');
        db.replicate.sync('http://localhost:5984/mydb');
        return db;

    });

