'use strict';

/**
 * @ngdoc directive
 * @name mangularcoApp.directive:methodList
 * @description
 * # methodList
 */
angular.module('mangularCoApp')
  .directive('methodList', ['methodList', function (methodList) {
    return {
      restrict: 'C',
      controller: function () {},
      link: function methodList ($scope, $el, $attrs, methodListCtrl) {
        $scope.doIt = function (method) {
          $scope.selectedMethod = method;
          window.selectedMethod = method.method.toString()
        }

        methodListCtrl.show = function () {
          $el[0].style.display = 'block';
        };

        methodListCtrl.hide = function () {
          $el[0].style.display = 'none';
        };

        methodListCtrl.getFirstItem = function () {
          return $el.children().eq(0).data('$scope');
        };

        for (var method in methodListCtrl) {
          if (methodListCtrl.hasOwnProperty(method)) {
            methodList[method] = methodListCtrl[method];
          }
        }
      }
    }
  }]);
