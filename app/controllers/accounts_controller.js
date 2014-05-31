'use strict';
angular.module('app.accounts_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.account', {
                url: '/account/index',
                views: {
                    'account-tab': {
                        templateUrl: 'views/account/index.html',
                        controller: 'AccountIndexCtrl'
                    }
                }
            })
    })

    .controller('AccountIndexCtrl', function ($scope, $stateParams,  $timeout, $ionicLoading, $localStorage, Pouch, PouchSync) {
        $scope.account = $localStorage.account;
        $scope.pouchSync = PouchSync;

        $scope.save = function(account) {
            $ionicLoading.show({template: 'Saving Settings <i class="ion-loading-c" />'});
            $localStorage.account = account;

            $timeout(function() {
                    PouchSync.connect();
                    $ionicLoading.hide();
                },
                300);

        };
    });

