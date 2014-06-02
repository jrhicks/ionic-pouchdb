'use strict';
angular.module('app.todos_controller', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('tabs.todos', {
                url: '/todos/index',
                views: {
                    'todos-tab': {
                        templateUrl: 'states/todos/index.html',
                        controller: 'TodosIndexCtrl as todosIndex'
                    }
                }
            })
            .state('tabs.todos_edit', {
                url: '/todos/edit/:id',
                views: {
                    'todos-tab': {
                        templateUrl: 'states/todos/edit.html',
                        controller: 'TodosEditCtrl'
                    }
                }
            })
    })

    .controller('TodosIndexCtrl', function ($scope, Todo, PouchPublisher, Pouch) {
        var self = this;

        self.form = {};
        self.todos = [];
        self.loading = true;
        self.refreshing = false;

        var allTodos = function(doc, emit) {
            if (doc.doc_type === 'todo') {
                emit(doc.created_at, doc._id);
            }
        }

        PouchPublisher.use(function() {
            if(self.refreshing === false)
            {
                self.refreshing = true;
                Pouch.db.query(allTodos, {descending: true, include_docs : true}).then( function(results) {
                    self.loading = false;
                    self.todos = results["rows"];
                    $scope.$digest();
                    self.refreshing=false;
                });
            }
        })

        this.add = function (form) {
            Todo.add(form);
            self.loading = true;
            self.form = {};
        };


    })

    .controller('TodosEditCtrl', function ($scope, $ionicNavBarDelegate, $stateParams, $ionicLoading,
                                           Todo, Pouch) {
        $scope.todo = {};

        Pouch.db.get($stateParams.id)
            .then(function(result) {
                $scope.todo = result;
                $scope.$digest();
            });

        $scope.save = function(todo) {
            $ionicLoading.show({template: 'Saving Todo Item <i class="ion-loading-c" />'});
            Pouch.db.put(todo)
                .then(function(result) {
                    $ionicLoading.hide();
                    $ionicNavBarDelegate.back();
                });
        }


    });
