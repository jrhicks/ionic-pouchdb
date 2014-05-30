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
                        controller: 'TodosIndexCtrl as todosIndex'
                    }
                }
            })
    })

    .controller('TodosIndexCtrl', function ($scope, todosService, pouch, controlHelper) {
        var self = this;

        self.form = {};
        self.todos = [];

        controlHelper.run( function() {
            todosService.all()
                .then(function(results) {
                    self.todos = results["rows"];
                    $scope.$digest();
                });
        });

        this.add = function (form) {
            todosService.add(form);
            self.form = {};
        };


    });
