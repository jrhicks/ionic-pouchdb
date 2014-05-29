'use strict';
angular.module('app.todos_ctrl', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome.todos', {
                url: '/todos/index',
                views: {
                    'todos-tab': {
                        templateUrl: 'states/todos/index.html',
                        controller: 'TodosIndexCtrl'
                    }
                }
            })
    })

    .controller('TodosIndexCtrl', function ($scope, todosService, db) {
        $scope.form = {};

        $scope.todos = [];
        db.onChange( function() {
            todosService.all()
                .then(function(results) {
                    $scope.todos = results["rows"];
                });
        });

        $scope.add = function (form) {
            todosService.add(form)
                .then(function(response) {
                    })
                .catch(function(error) {
                    })
                .finally(function() {
                    });

            $scope.form = {};
        };


    });
