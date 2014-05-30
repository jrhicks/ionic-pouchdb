'use strict';
angular.module('app.todos_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome.todos', {
                url: '/todos/index',
                views: {
                    'todos-tab': {
                        templateUrl: 'views/todos/index.html',
                        controller: 'TodosIndexCtrl as todosIndex'
                    }
                }
            })
    })

    .controller('TodosIndexCtrl', function ($scope, Todo, PouchWatcher) {
        var self = this;

        self.form = {};
        self.todos = [];

        PouchWatcher.use( function() {
            Todo.all()
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
