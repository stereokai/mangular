'use strict';

describe('Directive: codeView', function () {

  // load the directive's module
  beforeEach(module('mangularcoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<code-view></code-view>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the codeView directive');
  }));
});
