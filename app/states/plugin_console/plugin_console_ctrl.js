'use strict';
angular.module('app.plugin_console_ctrl', [])

    .config(function ($stateProvider) {
        // Collection States
        $stateProvider
            .state('welcome.plugin_console', {
                url: '/plugin_console/index',
                views: {
                    'plugin-console-tab': {
                        templateUrl: 'states/plugin_console/index.html',
                        controller: 'pluginConsoleIndexCtrl'
                    }
                }
            })

    })

    .controller('pluginConsoleIndexCtrl', function ($scope) {

    });
