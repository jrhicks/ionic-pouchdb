'use strict';

angular.module('app.account', [])
    .service('Account', function($localStorage) {
        return {
            database: 'http://localhost:5984/jrhicks',
            username: 'jrhicks',
            password: 'jrhicks',
            stayConnected: true
        };
    });