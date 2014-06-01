'use strict';
angular.module('app.accounts_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.account', {
                url: '/account/index',
                views: {
                    'account-tab': {
                        templateUrl: 'states/account/index.html',
                        controller: 'AccountIndexCtrl'
                    }
                }
            })
    })

    .controller('AccountIndexCtrl', function ($scope, $stateParams,  $timeout, $ionicLoading, $localStorage, Pouch) {
        $scope.account = $localStorage.account;
        $scope.Pouch = Pouch;

        $scope.save = function(account) {
            $ionicLoading.show({template: 'Saving Settings <i class="ion-loading-c" />'});
            $localStorage.account = account;

            $timeout(function() {
                    Pouch.connect();
                    $ionicLoading.hide();
                },
                300);

        };
    });

