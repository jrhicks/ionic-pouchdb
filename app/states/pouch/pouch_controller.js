'use strict';
angular.module('app.pouch_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.pouch', {
                url: '/pouch/index',
                views: {
                    'pouch-tab': {
                        templateUrl: 'states/pouch/index.html',
                        controller: 'PouchIndexCtrl'
                    }
                }
            })
    })

    .controller('PouchIndexCtrl', function ($scope, $stateParams,  $timeout, $ionicLoading, Pouch) {
        $scope.settings = Pouch.settings;
        $scope.Pouch = Pouch;

        $scope.reset = function() {
            $ionicLoading.show({template: 'You should restart the app.'});
            Pouch.reset();
        };

        $scope.save = function(settings) {
            $ionicLoading.show({template: 'Saving Settings <i class="ion-loading-c" />'});
            Pouch.saveSettings(settings);
            $timeout(function() {
                    Pouch.attemptConnection();
                    $ionicLoading.hide();
                },
                300);
        };
    });

