'use strict';

describe('Directive: searchField', function () {

  // load the directive's module
  beforeEach(module('mangular'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<search-field></search-field>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the searchField directive');
  }));
});
