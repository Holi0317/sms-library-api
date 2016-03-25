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

  describe('makeEmail', function() {
    it('should leave "From" blank when it is not given', function() {
      let res = utils.makeEmail(null, 'foo@bar.net', 'subject', 'body');
      res.should.equal('Q29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PSJVVEYtOCINCk1JTUUtVmVyc2lvbjogMS4wDQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA4Yml0DQoNCnRvOiBmb29AYmFyLm5ldA0Kc3ViamVjdDogc3ViamVjdA0KDQpib2R5');
    });

    it('should render message', function() {
      let res = utils.makeEmail('foo@bar.net', 'bar@bar.net', 'subject', 'body');
      res.should.equal('Q29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PSJVVEYtOCINCk1JTUUtVmVyc2lvbjogMS4wDQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA4Yml0DQpmcm9tOiBmb29AYmFyLm5ldA0KdG86IGJhckBiYXIubmV0DQpzdWJqZWN0OiBzdWJqZWN0DQoNCmJvZHk=');
    });
  });
});
