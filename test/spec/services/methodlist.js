'use strict';

describe('Service: methodList', function () {

  // load the service's module
  beforeEach(module('mangular'));

  // instantiate service
  var methodList;
  beforeEach(inject(function (_methodList_) {
    methodList = _methodList_;
  }));

  it('should do something', function () {
    expect(!!methodList).toBe(true);
  });

});
