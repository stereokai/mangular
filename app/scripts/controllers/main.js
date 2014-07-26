'use strict';

/**
 * @ngdoc function
 * @name mangular.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mangular
 */
angular.module('mangular')
  .controller('MainCtrl', function ($scope) {
    $scope.$on('api-apiReady', function () {
      $scope.api = arguments[1];
      $scope.$digest();
      $scope.selectedMethod = api[0]
    });
  });
