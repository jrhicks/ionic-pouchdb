'use strict';
angular.module('app.account_ctrl', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome.account', {
                url: '/account/index',
                views: {
                    'account-tab': {
                        templateUrl: 'states/account/index.html',
                        controller: 'AccountIndexCtrl'
                    }
                }
            })
            .state('welcome.signup', {
                url: '/account/signup',
                views: {
                    'account-tab': {
                        templateUrl: 'states/account/signup.html',
                        controller: 'AccountSignupCtrl'
                    }
                }
            })

    })

    .controller('AccountIndexCtrl', function ($scope, $stateParams,  $ionicLoading) {
        $scope.account = {username: null};

        $scope.signOut = function() {
            $ionicLoading.show({template: 'Signing Out <i class="ion-loading-c" />'});

            $scope.account = {};
//            xxx.signOut()
//                .then(
//                function() {
//                    $ionicLoading.hide();
//                    $scope.account = {};
//                },
//                function() {
//                    $ionicLoading.hide();
//                    $scope.account = {};
//                })
        };

        $scope.signIn = function(settings) {
            $ionicLoading.show({template: 'Signing In <i class="ion-loading-c" />'});
//            xxx.signIn(settings.username, settings.password)
//                .then(
//                    function() {
//                        $ionicLoading.hide();
//                        $scope.account = hoodieAccount;
//                    },
//                    function() {
//                        $ionicLoading.hide();
//                        toaster.pop('failure', "Login Failed", "Please check your username and password and try again.");
//                        $scope.account = hoodieAccount;
//                    }
//                )
            };
    })

    .controller('AccountSignupCtrl', function ($scope, $ionicNavBarDelegate, $ionicLoading) {

        $scope.form = {};

        $scope.cancel = function() {
            $ionicNavBarDelegate.back();
        };

        $scope.signUp = function(form) {
            $ionicLoading.show({template: 'Signing Up <i class="ion-loading-c" />'});
//            xxx.signUp(form.username, form.password)
//                .then(
//                function() {
//                    $ionicLoading.hide();
//                    $scope.account = hoodieAccount;
//                    $ionicNavBarDelegate.back();
//                },
//                function() {
//                    $ionicLoading.hide();
//                    toaster.pop('failure', "Unable to signup at this time.  Please try again later.");
//                    $scope.account = hoodieAccount;
//                });
        };

    });

