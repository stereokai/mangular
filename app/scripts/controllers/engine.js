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

      window.API = api;

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

  function findMethods (haystack, type) {
    var result = [];

    for (var i = 0, absoluteName = new AbsoluteName(), len = haystack.length, subResult, name; i < len; i++) {
      subResult = [];
      name = absoluteName.set(haystack[i].name);
      getProps(haystack[i]);
      result = result.concat(subResult);
    }

    return result;

    function getProps (obj) {
      if (typeof obj == 'function') {
        saveMethod(obj, absoluteName, type, subResult);
      }

      for (var property in obj) {
        if (obj.hasOwnProperty(property) && isPropOfValuableType(obj[property])) {
          var suspect = obj[property];

          if (Array.isArray(suspect)) {
            suspect.forEach(function (item) {
              isPropOfValuableType(item) && getProps(item);
            });
          } else if (typeof suspect == 'object') {
            if (suspect.jquery)                                continue;
            if (suspect.constructor.name == 'Scope')           continue;
            if (suspect.constructor.name == 'Window')          continue;
            if (name == '$route' && property != 'constructor') continue;

            getProps(suspect);
          } else if (typeof suspect == 'function') {
            if (property != 'constructor' &&
                (!suspect.name || absoluteName.toString() != suspect.name)) {
                  var shouldLevelUp = true;
                  absoluteName.append(suspect.name || property);
            }

            saveMethod(suspect, absoluteName, type, subResult);

            shouldLevelUp && absoluteName.levelUp();
          }
        }
      }
    }
  }

  function saveMethod (_fn, derivedName, type, subResult) {
    if (!('prototype' in _fn)) {
      return; // Native function
    }

    var fn = _fn.bind({});

    fn.toString = Function.prototype.toString.bind(_fn);

    fn._name = derivedName.toString();

    fn['_type'] = /^[a-zA-Z]+Filter/.test(name) ? FILTER : (fn._name.indexOf('.') > 0 ? type + ' method' : type);

    subResult.push(fn);
  }

  function isPropOfValuableType (item) {
    return typeof item == 'object' || typeof item == 'function' || Array.isArray(item);
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

  function AbsoluteName (name) {
    if (name) {
      this.set(name);
    }

    return name;
  }

  AbsoluteName.prototype = {
    set: function set (name) {
      if (typeof name == 'string') {
        this.name = name;

        var _this = this,
            proto = {};

        AbsoluteName.prototype.stringPrototype.forEach(function (fn) {
          proto[fn] = String.prototype[fn].bind(_this.name);
        })

        proto.length = function length () { return _this.name.length; };

        this.__proto__ = angular.extend(proto, AbsoluteName.prototype);

        return name;
      } else {
        throw Error('name is no a string');
      }
    },

    append: function append (name) {
      this.set(this.name + '.' + name);

      return this.name;
    },

    levelUp: function levelUp () {
      this.set(this.name.substring(0, this.name.lastIndexOf('.')));
      return this.name;
    },

    // Save all properties of String prototype bar length
    stringPrototype: Object.getOwnPropertyNames(String.prototype).splice(1)
  };
})(window);
