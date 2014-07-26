'use strict';

/**
 * @ngdoc function
 * @name mangularCoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mangularCoApp
 */
angular.module('mangularCoApp')
  .controller('MainCtrl', function ($scope) {
    $scope.$on('api-apiReady', function () {
      $scope.api = arguments[1];
      $scope.$digest();
      $scope.selectedMethod = api[0]
    });
  });
