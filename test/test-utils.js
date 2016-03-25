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
      res.should.equal('Q29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PSJVVEYtOCIKTUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UcmFuc2Zlci1FbmNvZGluZzogOGJpdAoKdG86IGZvb0BiYXIubmV0CnN1YmplY3Q6IHN1YmplY3QKCmJvZHk=');
    });

    it('should render message', function() {
      let res = utils.makeEmail('foo@bar.net', 'bar@bar.net', 'subject', 'body');
      res.should.equal('Q29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PSJVVEYtOCIKTUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UcmFuc2Zlci1FbmNvZGluZzogOGJpdApmcm9tOiBmb29AYmFyLm5ldAp0bzogYmFyQGJhci5uZXQKc3ViamVjdDogc3ViamVjdAoKYm9keQ==');
    });
  });
});
