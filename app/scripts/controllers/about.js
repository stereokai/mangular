'use strict';

/**
 * @ngdoc function
 * @name mangular.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mangular
 */
angular.module('mangular')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
