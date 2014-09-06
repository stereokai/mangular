'use strict';

/**
 * @ngdoc service
 * @name mangularApp.rAF
 * @description
 * # rAF
 * Factory in the mangularApp.
 */
angular.module('mangular')
  .factory('rAF', function rAF () {
    // Navigation timing polyfill
    if (typeof window.performance === 'undefined') {
      window.performance = {};
    }

    if (!window.performance.now) {
      var nowOffset;

      if (performance.timing && performance.timing.navigationStart) {
        nowOffset = performance.timing.navigationStart;
      } else {
        nowOffset = Date.now();
      }

      window.performance.now = function now () {
        return Date.now() - nowOffset;
      }
    }

    var _rAf = (function() {
      return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, el) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();

    function animator (fn, shouldProxy) {
      var startTime = window.performance && performance.now() || Date.now(),
          shouldKeepGoing = true,
          proxy;

      if (shouldProxy) {
        proxy = {
          break: cancel
        };

        fn = fn.bind(proxy);
      }

      animate(startTime);

      function animate (timestamp) {
        if (shouldKeepGoing) {
          fn(timestamp, startTime);
          _rAf(animate);
        }
      }

      function cancel () {
        console.log('ddd')
        shouldKeepGoing = false;
      }

      return cancel;
    }

    return function (fn, shouldProxy) {
      return new animator(fn, shouldProxy);
    }
  });
