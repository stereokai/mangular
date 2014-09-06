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
        $scope.keypress = function (e) {
          if ((e.keyCode || e.which) === 13) {
            e.preventDefault();
          }
        }

        $el.on('input', function () {
          if (this.value) {
            methodList.show();
          } else {
            methodList.hide();
          }

          $timeout(function () {
            $scope.selectedMethod = methodList.getFirstItem().method;
          }, 0);
        });
      }
    }
  });
