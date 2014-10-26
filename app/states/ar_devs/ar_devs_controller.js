'use strict';
angular.module('app.ar_devs_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.ar_devs', {
                url: '/ar_devs/index',
                views: {
                    'ar-devs-tab': {
                        templateUrl: 'states/ar_devs/index.html',
                        controller: 'ArDevIndexCtrl as ar_dev_index'
                    }
                }
            })

            .state('tabs.ar_devs_new', {
                url: '/ar_devs/new',
                views: {
                    'ar-devs-tab': {
                        templateUrl: 'states/ar_devs/new.html',
                        controller: 'ArDevNewCtrl as ar_dev_new'
                    }
                }
            })
    })

    .controller('ArDevIndexCtrl', function ($scope, ArDev, Pouch) {
        var self = this;

        self.form = {};
        self.ar_devs = [];
        self.loading = true;

        Pouch.publish(function() {
            var promise = Pouch.db.query('allDevs', {descending: true, include_docs : true, limit: 20})
                .then( function(results) {
                    self.loading = false;
                    self.inserting = false;
                    self.ar_devs = results["rows"];
                });
            return promise;
        });

    })


    .controller('ArDevNewCtrl', function ($scope, $ionicNavBarDelegate, $stateParams, $ionicLoading,
                                          ArDev, Pouch, $timeout) {
        var self = this;
        self.form = {};

        this.add = function (form) {
            ArDev.add(form);
            self.form = {};
            $ionicNavBarDelegate.back();
        };

    })



;
