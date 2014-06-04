'use strict';
angular.module('app.tabs_controller', [])
    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs', {
                url: '/tabs',
                controller: "TabsController",
                templateUrl: 'states/tabs/index.html'
            })
    })

    .controller('TabsController', function ($scope, Pouch) {
        $scope.pouch = Pouch;
    });