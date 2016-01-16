'use strict';

let chai = require('chai');

chai.should();

let utils = require('../backend/utils');

describe('Utilities', function() {
  describe('diff', function() {
    it('should return differences between two arrays', function() {
      utils.diff([1, 2, 3], [3, 4, 5]).should.deep.equal([1, 2]);
      utils.diff(['A tone of stuffs'], []).should.deep.equal(['A tone of stuffs']);
    });
  });
});
