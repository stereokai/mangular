'use strict';

/**
 * @ngdoc function
 * @name mangular.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mangular
 */
angular.module('mangular')
  .controller('MainCtrl', function ($scope, appInitPromise) {
    appInitPromise.resolve();
    $scope.$on('api-apiReady', function () {
      $scope.api = arguments[1];
      $scope.selectedMethod = $scope.api[0];
    });
  });
