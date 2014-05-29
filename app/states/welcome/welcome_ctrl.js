'use strict';
angular.module('app.welcome_ctrl', [])
    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome', {
                url: '/welcome',
                abstract: true,
                templateUrl: 'states/welcome/index.html'
            })
    })
