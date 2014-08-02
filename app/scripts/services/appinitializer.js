'use strict';

/**
 * @ngdoc service
 * @name mangularApp.Appinitializer
 * @description
 * # Appinitializer
 * Service in the mangularApp.
 */
angular.module('mangular')
  .factory('appInitPromise', function ($q) {
    var deferred = $q.defer();

    return deferred
  });

