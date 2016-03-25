'use strict';

let proxyquire = require('proxyquire');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');
let chai = require('chai');
let Promise = require('bluebird');

chai.use(sinonChai);
chai.should();

let utils = require('../backend/utils');

describe('Cron job', function() {
  let job, functions;
  let user;
  let google, calendar, gmail, OAuth2, config, LibraryApi, _utils;

  beforeEach(function mockExternalLib() {
    OAuth2 = {};
    OAuth2.setCredentials = sinon.stub();

    calendar = {
      calendarList: {
        listAsync: sinon.stub()
      },
      calendars: {
        insertAsync: sinon.stub()
      },
      events: {
        listAsync: sinon.stub(),
        updateAsync: sinon.stub(),
        insertAsync: sinon.stub(),
        deleteAsync: sinon.stub()
      }
    };

    gmail = {
      users: {
        messages: {
          send: function(a, b) {
            b();
          }
        }
      }
    };

    google = {
      calendar: function() {
        return calendar
      },
      gmail: function() {
        return gmail
      }
    };

    config = {
      clientId: 'config.ClientId',
      clientSecret: 'config.clientSecret',
      redirectUrl: 'config.redirectUrl',
      jwt: 'FAKE JWT OBJECT'  // For the sake of simplicity
    };

    user = {
      tokens: {
        refresh_token: 'refresh_token',
        expiry_date: 1452857436173,
        id_token: 'id_token',
        token_type: 'Bearer',
        access_token: 'access_token'
      },
      googleId: 'GoogleID',
      libraryLogin: 'login',
      libraryPassword: 'password',    // Worst password ever. Don't use it as real password
      renewDate: 3,
      renewEnabled: false,
      calendarName: 'slh autorenew',
      logs: [],
      log: sinon.stub()
    }
    user.save = sinon.stub();
    user.save.returns(Promise.resolve());

    LibraryApi = sinon.stub();
    LibraryApi.login = sinon.stub();
    LibraryApi.renewBook = sinon.stub();
    LibraryApi.reload = sinon.stub();
    LibraryApi.borrowedBooks = [];

    _utils = {
      oauth2clientFactory: sinon.stub()
    };
    _utils.oauth2clientFactory.returns(OAuth2);

    job = proxyquire('../backend/job', {
      googleapis: google,
      '../config': config,
      './api': function() {},
      './utils' : _utils
    });
    functions = new job._UserFunctions(user);
    functions.library = LibraryApi;

  });

  beforeEach(function stubGlobals() {
    sinon.stub(console, 'error');
  });

  afterEach(function() {
    console.error.restore();
  })

  it('should initialize.', function() {
    OAuth2.setCredentials.should.have.been.calledWithExactly(user.tokens);
  });

  it('should handle successful refresh token.', function() {
    OAuth2.refreshAccessTokenAsync = sinon.stub();
    OAuth2.refreshAccessTokenAsync.returns(Promise.resolve({
      expiry_date: 1452857436174,
      id_token: 'new id_token',
      token_type: 'Bearer',
      access_token: 'new access_token'
    }));

    return functions.refreshToken()
    .then(() => {
      functions.failed.should.be.false;
      user.tokens.should.deep.equal({
        expiry_date: 1452857436174,
        id_token: 'new id_token',
        token_type: 'Bearer',
        access_token: 'new access_token',
        refresh_token: 'refresh_token'
      });
      user.save.should.have.been.calledOnce;
    })
  });

  it('should handle fail of refresh token.', function() {
    let e = new Error('Refresh token error');
    OAuth2.refreshAccessTokenAsync = sinon.stub();
    OAuth2.refreshAccessTokenAsync.returns(Promise.reject(e));

    return functions.refreshToken()
    .catch(err => {
      functions.failed.should.be.true;
      err.should.be.an.instanceof(utils.BreakSignal);
      user.log.should.have.been.calledOnce;
      user.log.should.have.been.calledWithExactly('Cannot refresh Google token. Aborting.', 'FATAL');
      console.error.should.be.called;
    });
  })

  it('should do nothing when renew is not enabled.', function() {
    return functions.renewBooks()
    .then(res => {
      (typeof res === 'undefined').should.be.true;
    });
  });

  it('should process if renew is enabled.', function() {
    user.renewEnabled = true;
    LibraryApi.login.returns(Promise.resolve());
    LibraryApi.renewBook.returns(Promise.resolve());
    LibraryApi.borrowedBooks = [{
      // Should be renewed
      id: '0001',
      name: 'Example book A',
      borrowDate: new Date('1/6/2016'),
      dueDate: new Date('1/17/2016'),
      renewal: '2'
    }, {
      // Should be untouched
      id: null,
      name: 'Example book B overdued',
      borrowDate: new Date('12/30/2015'),
      dueDate: new Date('1/13/2016'),
      renewal: '5'
    }, {
      // Should be untouched
      id: '0003',
      name: 'Example book C',
      borrowDate: new Date('1/6/2016'),
      dueDate: new Date('1/30/2016'),
      renewal: '3'
    }];

    let clock = sinon.useFakeTimers(1452938366332);   // 1/16/2016 17:59

    return functions.renewBooks()
    .then(() => {
      functions.failed.should.be.false;

      LibraryApi.renewBook.should.have.been.calledOnce;
      LibraryApi.renewBook.should.have.been.calledWithExactly(LibraryApi.borrowedBooks[0]);

      user.log.should.have.been.calledTwice;

      let args = user.log.args;

      args[0][0].should.have.string('borrowed');
      args[0][0].should.have.string('Example book A');
      args[0][0].should.have.string('Example book B');
      args[0][0].should.have.string('Example book C');

      args[1][0].should.have.string('renewed');
      args[1][0].should.have.string('Example book A');

      clock.restore();
    })
  });

  it('should get calendar when match is found.', function() {

    calendar.calendarList.listAsync.returns(Promise.resolve({
      kind: 'calendar#calendarList',
      etag: 'ETag',
      items: [{
        kind: 'calendar#calendarListEntry',
        etag: 'ETag',
        id: '1000',
        summary: 'slh autorenew',
        description: 'This should match',
        hidden: false
      }, {
        kind: 'calendar#calendarListEntry',
        etag: 'ETag',
        id: '1001',
        summary: 'Nope Nope Nope.',
        description: 'This should not match',
        hidden: false
      }]
    }));

    return functions._getCalendar()
    .then(() => {
      functions.failed.should.be.false;
      functions.calendarID.should.be.equal('1000');
    });
  });

  it('should create calendar if match is not found.', function() {
    calendar.calendarList.listAsync.returns(Promise.resolve({
      kind: 'calendar#calendarList',
      etag: 'ETag',
      items: [{
        kind: 'calendar#calendarListEntry',
        etag: 'ETag',
        id: '1001',
        summary: 'Nope Nope Nope.',
        description: 'This should not match',
        hidden: false
      }]
    }));

    calendar.calendars.insertAsync.returns(Promise.resolve({
      kind: 'calendar#calendarListEntry',
      etag: 'ETag',
      id: '1000',
      summary: 'slh autorenew',
      description: 'This should match',
      hidden: false
    }));

    return functions._getCalendar()
    .then(() => {
      functions.failed.should.be.false;
      functions.calendarID.should.be.equal('1000');
    });
  });

  it('should create correct event resource', function() {
    let result = functions._createEventResource({
      id: '0001',
      name: 'Example book A',
      borrowDate: new Date('1/6/2016'),
      dueDate: new Date('1/30/2016'),
      renewal: '3'
    });

    result.should.have.property('summary', 'Due date for book Example book A. ID: 0001');
    result.should.have.deep.property('start.date', '2016-01-30');
    result.should.have.deep.property('end.date', '2016-01-30');
  });

  it('should refresh calendar.', function() {
    user.renewEnabled = true;
    functions.calendarID = '1000';
    functions._getCalendar = function () {
      return Promise.resolve();
    };
    let realCreateSRC = functions._createEventResource;
    functions._createEventResource = function (a) {
      let res = realCreateSRC(a);
      res.summary = a.id;
      return res;
    }
    LibraryApi.reload.returns(Promise.resolve());

    LibraryApi.borrowedBooks = [{
      id: '0001',
      name: 'Example book A',
      borrowDate: new Date('1/6/2016'),
      dueDate: new Date('1/30/2016'),
      renewal: '3'
    }, {
      id: '0002',
      name: 'Example book B',
      borrowDate: new Date('12/30/2015'),
      dueDate: new Date('1/30/2016'),
      renewal: '5'
    }, {
      id: '0003',
      name: 'Example book C',
      borrowDate: new Date('1/6/2016'),
      dueDate: new Date('1/30/2016'),
      renewal: '3'
    }];

    calendar.events.listAsync.returns({
      kind: 'calendar#events',
      summary: 'slh autorenew',
      items: [{
        // Should update
        kind: 'calendar#event',
        id: '2001',
        summary: '0001',
        start: {
          date: '2016-01-17',
          timeZone: 'Asia/Hong_Kong'
        },
        end: {
          date: '2016-01-17',
          timeZone: 'Asia/Hong_Kong'
        }
      }, {
        // Should untouch
        kind: 'calendar#event',
        id: '2002',
        summary: '0002',
        start: {
          date: '2016-01-30',
          timeZone: 'Asia/Hong_Kong'
        },
        end: {
          date: '2016-01-30',
          timeZone: 'Asia/Hong_Kong'
        }
      }, {
        // Should remove
        id: '2004',
        summary: '0004',
        start: {
          date: '2016-01-01',
          timeZone: 'Asia/Hong_Kong'
        },
        end: {
          date: '2016-01-01',
          timeZone: 'Asia/Hong_Kong'
        }
      }]
      // Should create event for book id = 0003
    });

    return functions.refreshCalendar()
    .then(() => {
      calendar.events.listAsync.should.have.been.calledOnce;
      let opt = calendar.events.listAsync.args[0][0];
      opt.should.have.property('calendarId', '1000');

      calendar.events.updateAsync.should.have.been.calledOnce;
      opt = calendar.events.updateAsync.args[0][0];
      opt.should.have.property('eventId', '2001');
      opt.should.have.deep.property('resource.start.date', '2016-01-30');

      calendar.events.insertAsync.should.have.been.calledOnce;
      opt = calendar.events.insertAsync.args[0][0];
      opt.should.have.deep.property('resource.summary', '0003');
      opt.should.have.deep.property('resource.start.date', '2016-01-30');

      calendar.events.deleteAsync.should.have.been.calledOnce;
      opt = calendar.events.deleteAsync.args[0][0];
      opt.should.have.property('eventId', '2004');
    });

  });

  it('should limit logs in database', function() {
    for (let i = 0; i < 150; i++) {
      user.logs.push({
        message: String(i),
        time: new Date()
      });
    }

    return functions.saveProfile()
    .then(() => {
      user.logs.should.have.length(100);
    });
  });


  it('should correctly consume email message', function() {
    functions.emails = ['foo@bar.net'];
    functions.emailMsgID = ['0001'];
    LibraryApi.borrowedBooks = [{
      id: '0001',
      mcode: '0001',
      name: 'Book name',
      dueDate: new Date(),
      borrowDate: new Date(),
      renewal: 5
    }]

    functions._getEmails = sinon.stub().returns(Promise.resolve());

    _utils.makeEmail = (a, b, c) => [a, b, c, 'message'];  // Just to make things clear

    let spy = sinon.spy(gmail.users.messages.send);
    gmail.users.messages.send = spy;

    return functions.consumeEmail()
    .then(() => {
      spy.should.have.been.calledOnce;
      spy.should.have.been.calledWith({
        auth: config.jwt,
        userId: 'me',
        resource: {
          raw: ['Library Helper', 'foo@bar.net', 'Library Helper reminder', 'message']
        }
      });
    });

  });

  it('should do no-op when email is none', function() {
    functions.emails = [];
    functions.emailMsgID = ['0001'];

    functions._getEmails = sinon.stub().returns(Promise.resolve());

    return functions.consumeEmail()
    .then(() => {
      gmail.users.messages.send.should.notCalled;
    });

  })

});
