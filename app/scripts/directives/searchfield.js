'use strict';

/**
 * @ngdoc directive
 * @name mangular.directive:searchField
 * @description
 * # searchField
 */
angular.module('mangular')
  .directive('searchField', function () {
    return {
      restrict: 'A',
      link: function searchField ($scope, $el, $attrs) {
        $el.on('input', function () {
          if (this.value) {
            dataList.show();
          } else {
            dataList.hide();
          }

          $timeout(function () {
            $scope.selectedMethod = dataList.getFirstItem();
          }, 0);
        });
      }
    }
  });
