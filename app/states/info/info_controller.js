'use strict';
angular.module('app.info_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.info', {
                url: '/info/index',
                views: {
                    'info-tab': {
                        templateUrl: 'states/info/index.html',
                        controller: 'InfoIndexCtrl'
                    }
                }
            })
    })

    .controller('InfoIndexCtrl', function ($scope, Pouch) {

        $scope.results = {};
        $scope.present = JSON.stringify;

        $scope.reset = function() {
            Pouch.reset()
                .then(function() {
                    $scope.digest();
                })
        }

        var q = function(doc) {
            emit(doc.created_at, doc._id);
        }

        Pouch.changesdb.query(q, {descending: true, include_docs : true})
            .then(function(results) {
                $scope.total_rows = results["total_rows"]
                $scope.data = results["rows"];
                console.log(JSON.stringify($scope.data[0]),undefined,4);
                $scope.$digest();
            })

    });

