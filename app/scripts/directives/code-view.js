'use strict';

/**
 * @ngdoc directive
 * @name mangular.directive:codeView
 * @description
 * # codeView
 */
angular.module('mangular')
  .directive('codeView', function (rAF) {
    var editorLines, lines, duration, lineThreshold,
        easings = {
          addShine: BezierEasing(.18,.59,.43,.83),
          removeShine: BezierEasing(.61,.28,.63,.79)
        };

    return {
      restrict: 'E',
      template: '<div></div>',
      replace: true,
      link: function postLink($scope, $el, $attrs) {
        var editor = ace.edit($el[0]),
            session = editor.getSession(),
            styleEl = document.createElement('style'),
            editorStyleSheet;

        editor.setTheme('ace/theme/monokai');
        session.setMode('ace/mode/javascript');

        session.setUseWorker(false);
        session.setUseWrapMode(true);
        session.setWrapLimitRange();
        session.setFoldStyle('manual');
        session.setTabSize(2);

        editor.setReadOnly(true);
        editor.setShowPrintMargin(false);
        editor.setOptions({
          selectionStyle: 'text',
          fontSize: '14px'
        });

        // Apparently some version of Safari needs the following line? I dunno.
        styleEl.appendChild(document.createTextNode(''));

        // Append style element to head
        document.head.appendChild(styleEl);

        // Grab style sheet
        editorStyleSheet = styleEl.sheet;
        editorStyleSheet.insertRule('.ace_editor { font-family: inconsolata, Menlo, Monaco, Consolas, "Courier New", monospace }', editorStyleSheet.cssRules.length);

        $scope.$watch('selectedMethod', function (newMethod, oldMethod) {
          if (newMethod) {
            editor.setOptions({
                minLines: newMethod.loc + 1,
                maxLines: Infinity
            });

            editor.setValue(newMethod.code);
            editor.getSelection().clearSelection();
            editor.gotoLine(1);

            setTimeout(shine, 1000);
          }
        });
      }
    };

    function shine () {
      editorLines = document.querySelectorAll('.ace_line_group');
      editorLines = Array.prototype.slice.apply(editorLines);

      lines = editorLines.length;
      duration = lines * 40;
      lineThreshold = duration / lines;

      setTimeout(flash('add'), 0);
      setTimeout(flash('remove'), 200);
    }

    function flash (method) {
      return function () {
        var currLine = 0;
        rAF(function (timestamp, startTime) {
          var elapsed = timestamp - startTime;

          if (easings[method + 'Shine'](elapsed / duration) * duration > lineThreshold * currLine) {
            editorLines[currLine++].classList[method]('shine');
          }

          if (currLine === lines) { this.break(); }
        }, true);
      }
    }

    function BezierEasing (mX1, mY1, mX2, mY2) {
      if (!(this instanceof BezierEasing)) return new BezierEasing(mX1, mY1, mX2, mY2);

      function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
      function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
      function C(aA1)      { return 3.0 * aA1; }

      // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
      function CalcBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
      }

      // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
      function GetSlope(aT, aA1, aA2) {
        return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
      }

      function GetTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;
        for (var i = 0; i < 4; ++i) {
          var currentSlope = GetSlope(aGuessT, mX1, mX2);
          if (currentSlope === 0.0) return aGuessT;
          var currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
      }

      return function (aX) {
        if (mX1 === mY1 && mX2 === mY2) return aX; // linear
        return CalcBezier(GetTForX(aX), mY1, mY2);
      };
    }
  });
