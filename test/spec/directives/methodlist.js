'use strict';

describe('Directive: methodList', function () {

  // load the directive's module
  beforeEach(module('mangular'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<method-list></method-list>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the methodList directive');
  }));
});
