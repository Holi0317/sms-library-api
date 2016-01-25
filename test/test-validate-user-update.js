'use strict';

let chai = require('chai');

chai.should();

let check = require('../backend/validate/user-update');

function shouldThrowError() {}

describe('Validate user update form', function() {

  it('should pass if all field is presence with correct type.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password'
    };

    return check(data);
  });

  it('should pass if library* is undefined while renew is disabled.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarName: 'calendar Name'
    };

    return check(data);
  });

  it('should pass if library* have correct type while renew is enabled.', function () {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarName: 'calendarName',
      libraryLogin: 'Login name',
      libraryPassword: 'Password'
    }

    return check(data);
  });

  it('should fail if one field have incorrect type.', function() {
    let data = {
      renewEnabled: 'Noooooo',
      renewDate: 'ThrEEEEEE',
      calendarName: 100,
      libraryLogin: function() {},
      libraryPassword: ['This', 'is', {nonsence: true}]
    }

    return check(data)
    .then(() => {
      throw new shouldThrowError();
    })
    .catch(err => {
      if (err instanceof shouldThrowError) {
        throw new Error('Expected to fail. But succeed.');
      }
      err.message.should.be.a('string');
    });
  });

  it('should fail if library* is undefined while renew is enabled.', function () {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarName: 'calendar name'
    };

    return check(data)
    .then(() => {
      throw new shouldThrowError();
    })
    .catch(err => {
      if (err instanceof shouldThrowError) {
        throw new Error('Expected to fail. But succeed.');
      }
      err.message.should.be.a('string');
    });
  });

  it('should fail if one field is absence.', function () {
    return check({})
    .then(() => {
      throw new shouldThrowError();
    })
    .catch(err => {
      if (err instanceof shouldThrowError) {
        throw new Error('Expected to fail. But succeed.');
      }
      err.message.should.be.a('string');
    });
  });

});
