'use strict';

angular.module('app.pouch', [])
    .service('Pouch', function() {
        return new PouchDB("mylocalstore");
    });

