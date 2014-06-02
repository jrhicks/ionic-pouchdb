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
        $scope.account = Pouch.getRemoteAccount();
        $scope.Pouch = Pouch;

        $scope.present = JSON.stringify;
        $scope.sync_info = Pouch.getInfo();

        $scope.reset = function() {
            Pouch.reset()
                .then(function() {
                    $scope.digest();
                })
        };

        $scope.save = function(account) {
            $ionicLoading.show({template: 'Saving Settings <i class="ion-loading-c" />'});
            Pouch.setRemoteAccount(account);

            $timeout(function() {
                    Pouch.connect();
                    $ionicLoading.hide();
                },
                300);

        };
    });

