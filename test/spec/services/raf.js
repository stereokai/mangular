'use strict';

describe('Service: rAF', function () {

  // load the service's module
  beforeEach(module('mangularApp'));

  // instantiate service
  var rAF;
  beforeEach(inject(function (_rAF_) {
    rAF = _rAF_;
  }));

  it('should do something', function () {
    expect(!!rAF).toBe(true);
  });

});
