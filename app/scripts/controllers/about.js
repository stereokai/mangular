'use strict';

/**
 * @ngdoc function
 * @name mangularCoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mangularCoApp
 */
angular.module('mangularCoApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
