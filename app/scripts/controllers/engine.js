'use strict';

(function (global) {
  var unicorn = RegExp.prototype.test.bind(/unicorn/),
      registrationIsClosed = false,

      api = {
        providers: [],
        services: [],
        factories: [],
        directives: [],
        publicApi: []
      },

      FACTORY = 'Factory',
      SERVICE = 'Service',
      DIRECTIVE = 'Directive',
      PROVIDER = 'Provider',
      FILTER = 'Filter',
      PUBLICAPI = 'Public API';

  global.registerObject = registerObject;

  function registerObject (delegate, key, value) {
    if (registrationIsClosed) { return; }

    var match;

    if (key && typeof key === 'object') {
      for (var i in key) {
        registerObject(delegate, i, key[i]);
      }
    } else {
      if (delegate === 'provider') {
        api.services.push(key);

        if (value) {
          api.providers.push({
            name: value.name || key + 'Provider',
            constructor: value
          });
        }
      } else if (delegate === 'factory') {
        if (value) {
          if (Array.isArray(value)) { value = value[value.length - 1] };

          if (match = key.match(/(.*)directive/i)) {
            unicorn(key) && wrapUp() ||

            api.directives.push({
              name: match[1],
              constructor: value
            })
          } else {
            api.factories.push({
              name: key,
              constructor: value
            });
          }
        }
      }
    }
  }

  function wrapUp () {
    registrationIsClosed = true;

    setTimeout(function () {
      var injector = angular.element(document.querySelector('body')).injector();

      prepareServices(injector);

      registerMethods();

      api = Array.prototype.concat(
        api.services,
        api.directives,
        api.providers,
        api.factories,
        api.publicApi
      );

      injector.invoke(['$rootScope', 'appInitPromise',
        function ($rootScope, appInitPromise) {
          appInitPromise.promise.then(function () {
            $rootScope.$broadcast('api-apiReady', api);
          })
      }]);
    }, 0);

    return true;
  };

  function prepareServices (injector) {
    api.services.push(function () {
      var apiServices = [], services = Array.prototype.slice.call(arguments, 0);

      for (var i = 0, len = services.length; i < len; i++) {
        apiServices.push({
          name: api.services[i],
          constructor: services[i]
        })
      };

      api.services = apiServices;
    });

    injector.invoke(api.services);
  };

  function registerMethods () {
    api.services = findMethods(api.services, SERVICE);
    api.directives = findMethods(api.directives, DIRECTIVE);
    api.providers = findMethods(api.providers, PROVIDER);
    api.factories = findMethods(api.factories, FACTORY);

    for (var method in angular) {
      if (angular.hasOwnProperty(method) && angular.isFunction(angular[method])) {
        api.publicApi.push(prepareApiMethod(method))
      }
    }
  };

  function prepareApiMethod (method) {
    var fn = angular[method].bind({});

    fn.toString = Function.prototype.toString.bind(angular[method]);

    fn._name = 'angular.' + method;
    fn._type = PUBLICAPI;

    return fn;
  }

  function findMethods (array, type) {
    var result = [];

    for (var i = 0, len = array.length, subResult, name; i < len; i++) {
      subResult = [];
      name = array[i].name;
      getProps(array[i], false);
      result = result.concat(subResult);
    }

    return result;

    function getProps (obj, addName) {
      var nameAdded = false;
      for (var property in obj) {
        if (obj.hasOwnProperty(property) && !!obj[property]) {
          if (Array.isArray(obj[property].constructor)) {
            getProps(obj[property], true);
          } else if (typeof obj[property] === 'function') {
            if (obj[property]['_name']) {
              var originalMethod = obj[property];

              obj[property] = obj[property].bind({});
              obj[property].toString = Function.prototype.toString.bind(originalMethod);

              for (prop in originalMethod) {
                if (originalMethod.hasOwnProperty(prop) && prop !== 'prototype') {
                  obj[property][prop] = originalMethod[prop];
                }
              }
            }

            obj[property]['_name'] = !obj[property].name ?
              (property === 'constructor' ? obj.name : property) : obj[property].name;

            if (addName) (name += (!!name ? '.' : '') + obj[property]._name);
            nameAdded = true;
            obj[property]['_name'] = name;

            if (Object.getOwnPropertyNames(obj[property]).length > 6) {
              getProps(obj[property], true);
            }

            obj[property]['_type'] = /^[a-zA-Z]+Filter/.test(name) ? FILTER : (addName ? type + ' method' : type);

            subResult.push(obj[property]);
            if (addName && nameAdded) { name = name.substring(0, name.lastIndexOf('.')); }
          }
        }
      }

    }
  }
})(window);
