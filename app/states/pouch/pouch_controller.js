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
            Pouch.reset()
                .then(function() {
                    $ionicLoading.show({template: 'You should restart the app.'});
                })
        };

        $scope.save = function(settings) {
            //$ionicLoading.show({template: 'Saving Settings <i class="ion-loading-c" />'});
            alert(JSON.stringify(settings));
            Pouch.saveSettings(settings);
            //$timeout(function() {
            //        Pouch.connect();
            //        $ionicLoading.hide();
            //    },
            //    300);
        };
    });

