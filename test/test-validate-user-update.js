'use strict';

let chai = require('chai');
let proxyquire = require('proxyquire');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
let Promise = require('bluebird');

chai.use(sinonChai);
chai.should();

function shouldThrowError() {}

describe('Validate user update form', function() {

  let check;
  let libraryMock, _libraryMock, models;

  beforeEach(function() {

    libraryMock = {
      checkLogin: sinon.stub()
    };
    libraryMock.checkLogin.returns(Promise.resolve());

    _libraryMock = sinon.stub();
    _libraryMock.returns(libraryMock);

    models = {
      user: {
        find: sinon.stub()
      }
    };
    models.user.find.returns(Promise.resolve([]));

    check = proxyquire('../backend/validate/user-update', {
      '../api': _libraryMock,
      '../models': models
    });
  });

  it('should send request for validation of library login and password.', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };

    return check(data)
    .then(() => {
      _libraryMock.should.have.been.calledWithNew;
      libraryMock.checkLogin.should.have.been.calledOnce;
      libraryMock.checkLogin.should.have.calledWithExactly('Login name', 'Password');
    });
  });

  it('should fail if library login and password checks failes.', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };
    let error = new Error('Reject promise.');

    libraryMock.checkLogin.returns(Promise.reject(error));

    return check(data)
    .then(() => {
      throw new shouldThrowError();
    })
    .catch(err => {
      if (err instanceof shouldThrowError) {
        throw new Error('Expected to fail. But succeed.');
      }
      _libraryMock.should.have.been.calledWithNew;
      libraryMock.checkLogin.should.have.been.calledOnce;
      libraryMock.checkLogin.should.have.calledWithExactly('Login name', 'Password');
      error.message.should.equal(err.message);
    });
  });

  it('should query Database for duplicate user record.', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };
    let googleId = 'Fake google ID';

    return check(data, googleId)
    .then(() => {
      models.user.find.should.have.been.calledOnce;
      let args = models.user.find.args[0][0];
      args.libraryLogin.should.equal('Login name');
      args.googleId.$ne.should.equal(googleId);
    });
  });

  it('should fail it duplicate user record found.', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };

    models.user.find.returns(Promise.resolve(['Fake user record.']));

    return check(data)
    .then(() => {
      throw new shouldThrowError();
    })
    .catch(err => {
      if (err instanceof shouldThrowError) {
        throw new Error('Expected to fail. But succeed.');
      }
    });
  });

  it('should pass if all field is presence with correct type.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };

    return check(data);
  });

  it('should pass if library* is undefined while renew is disabled.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarName: 'calendar Name',
      calendarEnabled: false,
      emailEnabled: false
    };

    return check(data);
  });

  it('should pass if library* have correct type while renew is enabled.', function () {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      calendarEnabled: false,
      emailEnabled: false
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

  it('should pass if email is provided and enabled', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: true,
      emailAddress: 'foo@bar.net'
    };

    return check(data)
  });

  it('should fail if email is enabled but address is not provided', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: false,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: true,
      emailAddress: ''
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

  it('should pass if calendar is enabled and name is provided', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: true,
      calendarName: 'calendar Name',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
    };

    return check(data);
  });

  it('should fail if calendar is enabled but name is not provided', function() {
    let data = {
      renewEnabled: true,
      renewDate: 3,
      calendarEnabled: true,
      calendarName: '',
      libraryLogin: 'Login name',
      libraryPassword: 'Password',
      emailEnabled: false,
      emailAddress: 'foo@bar.net'
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

  it('should pass if renew is not enabled but email address is not provided', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarEnabled: false,
      emailEnabled: false
    };

    return check(data);
  });

  it('should pass if email is enabled, renew disabled and address is provided.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarEnabled: false,
      emailEnabled: true,
      emailAddress: 'foo@bar.net'
    };

    return check(data);
  });

  it('should pass if email is enabled, renew disabled but address is not provided.', function() {
    let data = {
      renewEnabled: false,
      renewDate: 3,
      calendarEnabled: false,
      emailEnabled: true,
      emailAddress: ''
    };

    return check(data);
  });

});
