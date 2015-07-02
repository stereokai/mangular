'use strict';

(function (global) {
  var getClassOf = Function.prototype.call.bind(Object.prototype.toString);
  var getProtoOf = Function.prototype.call.bind(Object.__proto__);

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
    //console.log(delegate, key, value);
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
            unicorn(key) && wrapUp();
          } else {
            api.factories.push({
              name: key,
              constructor: value
            });
          }
        }
      } else if (delegate === 'directive') {
       //console.log(name, registrationIsClosed)
        api.directives.push({
          name: key,
          constructor: value
        });
      }
    }
  }

  function wrapUp () {
    registrationIsClosed = true;

    setTimeout(function () {
      var injector = angular.element(document.querySelector('body')).injector();

      invokeServices(injector);
      prepareMethods();

      api = Array.prototype.concat(
        api.services,
        api.directives,
        api.providers,
        api.factories,
        api.publicApi
      );

      console.log(api)

      registerMethods();
      prettifyMethods();

      injector.invoke(['$rootScope', 'appInitPromise',
        function ($rootScope, appInitPromise) {
          appInitPromise.promise.then(function () {
            $rootScope.$broadcast('api-apiReady', api);
          })
      }]);
    }, 0);

    return true;
  };

  function registerMethods () {
    api = api.map(function (method) {
      //console.log(method._name)
      method._uid = generateUID();
      return method;
    });
  }

  function generateUID() {
    return ('0000' + (Math.random() * Math.pow(36 , 4) << 0).toString(36)).slice(-4)
  }

  function invokeServices (injector) {
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

  function prepareMethods () {
    api.services = findMethods(api.services, SERVICE);
    // api.directives = findMethods(api.directives, DIRECTIVE);
    // api.providers = findMethods(api.providers, PROVIDER);
    // api.factories = findMethods(api.factories, FACTORY);

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
  var classNames = {};
  function findMethods (array, type) {
    var result = [];

    for (var i = 0, absoluteName = '', len = array.length, subResult, name; i < len; i++) {
      subResult = [];
      name = array[i].name;
      getProps(array[i]);
      result = result.concat(subResult);
    }

    return result;

    function getProps (obj, levelUp) {
      var nameAdded = false;
      for (var property in obj) {
        if (obj.hasOwnProperty(property) && !!obj[property] && isPropOfValuableType(obj[property])) {
          var item = obj[property];
          //console.log(item)
          if (Array.isArray(item)) {
            item.forEach(function (arrayItem) {
              isPropOfValuableType(arrayItem) && getProps(arrayItem, false);
            });
          } else if (typeof item == 'object') {
            if (item.jquery)                        continue;
            if (item.constructor.name == 'Scope')   continue;
            if (item.constructor.name == 'Window')  continue;

            if (property == 'constructor' || property == 'this') {
              if (Object.getPrototypeOf(item) != Object.prototype) {
                console.log(Object.getPrototypeOf(item).constructor.name, item.constructor.name)

                if (isNative(item))                     continue;
                if (classNames[item.constructor.name])  continue;

                classNames[item.constructor.name] = 1;

                  getProps(item.constructor.prototype, true);

              }
            }

            getProps(item, true);
          } else if (typeof item == 'function') {
            var fn = item;

            if (!('prototype' in fn)) return; // Native function

            fn._name = property == 'constructor' ? obj.name : (fn.name || property);
            if (Object.getOwnPropertyNames(fn).length > 6) {
              absoluteName += fn._name + '.';
              getProps(fn, true);
            }

            fn._name = absoluteName + fn._name;

            fn['_type'] = /^[a-zA-Z]+Filter/.test(name) ? FILTER : (!!absoluteName ? type + ' method' : type);

            subResult.push(fn);
          }
        }
      }

      levelUp && (absoluteName = absoluteName.substring(0, absoluteName.lastIndexOf('.')));
    }
  }

  function isPropOfValuableType (property) {
    return typeof property == 'object' || typeof property == 'function';
  }

  function prettifyMethods () {
    api = api.map(function (method) {
      var code = method.toString(),
          codeLines = code.split(/\r\n|\r|\n/),
          totalLOC = codeLines.length,
          trimOffset;

      if (totalLOC > 1) {
        trimOffset = findTrimOffset(codeLines, totalLOC);

        // remove the excess white-space from the beginning of each line
        codeLines = codeLines.map(function (line, idx) {
          return idx && line.trim() && isNotUseStrict(line) ? line.slice(trimOffset) : line;
        });

        code = '';
        for (var i = 0; i < totalLOC; i++) {
          code += codeLines[i] + '\n';
        }
      }

      method.code = code;
      method.loc = totalLOC;

      return method;
    });
  }

  function findTrimOffset (codeLines, lastLine) {
    for (var i = 1; i < lastLine; i++) {
      if (codeLines[i].trim() && isNotUseStrict(codeLines[i])) {
        return codeLines[i].match(/^\s*/)[0].length - 2;
      }
    }
  }

  function isNotUseStrict (code) {
    return code.indexOf('use strict') === -1;
  }

  var isNative  = (function() {
    // Used to resolve the internal `[[Class]]` of values.
    var toString = Object.prototype.toString;

    // Used to resolve the decompiled source of functions.
    var fnToString = Function.prototype.toString;

    // Used to detect host constructors (Safari > 4; really typed array specific).
    var reHostCtor = /^\[object .+?Constructor\]$/;

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    var reNative = RegExp('^' +
      // Coerce `Object#toString` to a string.
      String(toString)
      // Escape any special regexp characters.
      .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
      // Replace mentions of `toString` with `.*?` to keep the template generic.
      // Replace thing like `for ...` to support environments, like Rhino, which add extra
      // info such as method arity.
      .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    function isNative (value) {
      var type = typeof value;
      return type == 'function'
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        ? reNative.test(fnToString.call(value))
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
    }

    // Export however you want.
    return isNative;
  })();
})(window);
