      window.api = {
        providers: [],
        services: [],
        factories: [],
        directives: [],
        publicApi: []
      };

      var unicorn = RegExp.prototype.test.bind(/unicorn/),
          registrationIsClosed = false;

      function registerObject (delegate, key, value) {
        if (registrationIsClosed) { return; }

        var match;

        if (key && typeof key === 'object') {
          for (i in key) {
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

          injector.invoke(['$rootScope', function ($rootScope) {
            $rootScope.$broadcast('api-apiReady', window.api);
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
        api.services = findMethods(api.services);
        api.directives = findMethods(api.directives);
        api.providers = findMethods(api.providers);
        api.factories = findMethods(api.factories);

        for (method in angular) {
          if (angular.hasOwnProperty(method) && angular.isFunction(angular[method])) {
            api.publicApi.push(prepareApiMethod(method))
          }
        }
      };

      function prepareApiMethod (method) {
        var fn = angular[method].bind({});

        fn.toString = Function.prototype.toString.bind(angular[method]);

        fn._name = 'angular.' + method;

        return fn;
      }

      function findMethods (array) {
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

                obj[property]['_name'] = !obj[property].name ? (property === 'constructor' ? obj.name : property) : obj[property].name;
                if (addName) (name += (!!name ? '.' : '') + obj[property]._name);
                nameAdded = true;
                obj[property]['_name'] = name;

                if (Object.getOwnPropertyNames(obj[property]).length > 6) {
                  getProps(obj[property], true);
                }

                subResult.push(obj[property]);
                if (addName && nameAdded) { name = name.substring(0, name.lastIndexOf('.')); }
              }
            }
          }

        }
      }