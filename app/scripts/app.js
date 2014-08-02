'use strict';

/**
 * @ngdoc overview
 * @name mangular
 * @description
 * # mangular
 *
 * Main module of the application.
 */
angular
  .module('mangular', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'unicorn-directive',
    'hljs'
  ])

  .config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

      $locationProvider
        .html5Mode(true);
  }])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }])

  .run(function (appInitPromise) {})

  .filter('camelCase', function () {
    return function camelCase (name) {
      var x = arguments;
      debugger
    }
  });
