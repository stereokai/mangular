'use strict';

/**
 * @ngdoc directive
 * @name mangular.directive:searchField
 * @description
 * # searchField
 */
angular.module('mangular')
  .directive('searchField', function ($timeout, methodList) {
    return {
      restrict: 'A',
      link: function searchField ($scope, $el, $attrs) {
        $el.on('input', function () {
          if (this.value) {
            methodList.show();
          } else {
            methodList.hide();
          }

          $timeout(function () {
            $scope.selectedMethod = methodList.getFirstItem();
          }, 0);
        });
      }
    }
  });
