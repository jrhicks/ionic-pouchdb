'use strict';

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic',
                       'ui.router',
                       'pouchdb',
                       'uuid',
                       'app.db',
                       'app.welcome_ctrl',
                       'app.todos_ctrl',
                       'app.todos_srvc',
                       'app.account_ctrl',
                       'app.plugin_console_ctrl'
    ])

    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          // Set the statusbar to use the default style, tweak this to
          // remove the status bar on iOS or change it to use white instead of dark colors.
          StatusBar.styleDefault();
        }
      })

    })


//    .config(function(hoodieProvider) {
//        var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "Web";
//        var host=""
//
//        switch(deviceType) {
//            case "iPad":
//                host = "http://localhost:9000"
//                break;
//            case "iPhone":
//                host = "http://localhost:9000"
//                break;
//            case "Android":
//                // Access host machine from Genymotion using  on network vboxnet0
//                // Run ifconfig vboxnet0 or on Windows ipconfig to determine
//                host = "http://191.168.228.1:9000"
//                break;
//            default:
//                host = "http://localhost:9000"
//        }
//        hoodieProvider.url(host);
//    })

    .config(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise('/welcome/todos/index');
    });
