'use strict';

/**
 * @ngdoc directive
 * @name mangular.directive:codeView
 * @description
 * # codeView
 */
angular.module('mangular')
  .directive('codeView', function () {
    return {
      restrict: 'E',
      template: '<div></div>',
      replace: true,
      link: function postLink($scope, $el, $attrs) {
        var editor = ace.edit($el[0]),
            styleEl = document.createElement('style'),
            editorStyleSheet;

        editor.setTheme('ace/theme/monokai');
        editor.getSession().setMode('ace/mode/javascript');
        editor.setReadOnly(true);

        window.editor = editor;

        // Apparently some version of Safari needs the following line? I dunno.
        styleEl.appendChild(document.createTextNode(''));

        // Append style element to head
        document.head.appendChild(styleEl);

        // Grab style sheet
        editorStyleSheet = styleEl.sheet;
        editorStyleSheet.insertRule('.ace_editor { font-family: inconsolata, Menlo, Monaco, Consolas, "Courier New", monospace }', editorStyleSheet.cssRules.length);
      }
    };
  });
