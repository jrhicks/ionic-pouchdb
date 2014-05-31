'use strict';
angular.module('app.tabs_controller', [])
    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs', {
                url: '/tabs',
                controller: "TabsController",
                templateUrl: 'views/tabs/index.html'
            })
    })
    .controller('TabsController', function ($scope, PouchSync) {
        $scope.accountIcon = function() {
            if (PouchSync.isConnected()) {
                return "ion-ios7-checkmark-outline"
            } else {
                return "ion-ios7-circle-outline"
            }
        }
    });