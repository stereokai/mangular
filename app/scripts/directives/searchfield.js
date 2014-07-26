'use strict';

/**
 * @ngdoc directive
 * @name mangularcoApp.directive:searchField
 * @description
 * # searchField
 */
angular.module('mangularCoApp')
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
