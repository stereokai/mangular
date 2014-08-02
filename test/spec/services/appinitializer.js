'use strict';

describe('Service: Appinitializer', function () {

  // load the service's module
  beforeEach(module('mangularApp'));

  // instantiate service
  var Appinitializer;
  beforeEach(inject(function (_Appinitializer_) {
    Appinitializer = _Appinitializer_;
  }));

  it('should do something', function () {
    expect(!!Appinitializer).toBe(true);
  });

});
