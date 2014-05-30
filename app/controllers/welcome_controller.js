'use strict';
angular.module('app.welcome_controller', [])
    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                abstract: true,
                templateUrl: 'views/welcome/index.html'
            })
    })
