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
      res.should.equal('VG86IGZvb0BiYXIubmV0DQpTdWJqZWN0OiBzdWJqZWN0DQpDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9IlVURi04Ig0KTUlNRS1WZXJzaW9uOiAxLjANCmJvZHk=');
      /*
      // The base64 is:
      To: foo@bar.net
      Subject: subject
      Content-Type: text/plain; charset="UTF-8"
      MIME-Version: 1.0
      body
      */

    });

    it('should render message', function() {
      let res = utils.makeEmail('foo@bar.net', 'bar@bar.net', 'subject', 'body');
      res.should.equal('RnJvbTogZm9vQGJhci5uZXQNClRvOiBiYXJAYmFyLm5ldA0KU3ViamVjdDogc3ViamVjdA0KQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PSJVVEYtOCINCk1JTUUtVmVyc2lvbjogMS4wDQpib2R5');
    });
  });
});
