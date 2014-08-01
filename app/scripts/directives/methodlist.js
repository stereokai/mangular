'use strict';

/**
 * @ngdoc directive
 * @name mangular.directive:methodList
 * @description
 * # methodList
 */
angular.module('mangular')
  .directive('methodList', function ($document, methodList) {
    return {
      restrict: 'C',
      controller: function () {},
      link: function methodListLinker ($scope, $el, $attrs, methodListCtrl) {
        $scope.doIt = function (method) {
          $scope.selectedMethod = method;
          window.selectedMethod = method.method.toString()
        }

        methodListCtrl.show = function () {
          $el[0].style.display = 'block';
        };

        methodListCtrl.hide = function () {
          console.log('hihi')
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

        $el.on('click', methodList.hide);
        $document
          .off('click', methodList.hide)
          .on('click', methodList.hide);

        $scope.$on('$destroy', function () {
          $document.off('click', methodList.hide);
        });
      }
    }
  });
