'use strict';

let proxyquire = require('proxyquire');
let sinon = require('sinon');
let chai = require('chai');

chai.should();

let Promise = require('bluebird');
let fs = require('fs');
let readAsync = Promise.promisify(fs.readFile);

describe('Library API', function() {
  let api, request;
  let user, parser;

  beforeEach(function mockExternalLib() {
    let decode = function(a) {return a};
    request = sinon.stub();
    request.returns(Promise.resolve());
    api = proxyquire('../backend/api', {
      'iconv-lite': {
        decode: decode
      },
      'request-promise': request
    });
  });

  beforeEach(function setUpInstance() {
    user = new api();
    parser = user.parser;
  });

  describe('Parser', function() {

    it('should correctly parse when no book is borrowed.', function() {
      return readAsync(__dirname + '/responses/showRenew-no-book.html')
        .then(parser.showRenew.bind(parser))
        .then(() => {
          user.borrowedBooks.should.be.empty;
        });
    });

    it('should parse 2 books when 2 is borrowed.', function() {
      return readAsync(__dirname + '/responses/showRenew-books.html')
        .then(parser.showRenew.bind(parser))
        .then(() => {
          user.borrowedBooks.should.have.length(2);
        });
    });

    it('should parse books correctly', function() {
      return readAsync(__dirname + '/responses/showRenew-books.html')
        .then(parser.showRenew.bind(parser))
        .then(() => {
          user.borrowedBooks[0].should.have.property('id', '26968');
          user.borrowedBooks[0].should.have.property('name', 'Everlasting Sorrow /Robert ELEGANT.');
          user.borrowedBooks[0].borrowDate.should.be.a('Date');
          user.borrowedBooks[0].borrowDate.valueOf().should.equal(1448985600000);  // 2015/12/2
          user.borrowedBooks[0].dueDate.should.be.a('Date');
          user.borrowedBooks[0].dueDate.valueOf().should.equal(1453737600000);   // 2016/1/26
          user.borrowedBooks[0].should.have.property('renewal', '3');
        });
    });

    it('should parse reader ID from information page.', function() {
      user.language = 'english';
      return readAsync(__dirname + '/responses/info.html')
        .then(parser.info.bind(parser))
        .then(() => {
          user.readerId.should.equal('0001');
        });
    });

  });

  describe('User', function() {
    it('should send renew request to server when requested.', function() {

      user.id = '0001';
      user.language = 'english';

      return user.renewBook({
        id: '3000'
      })
        .then(() => {
          request.calledOnce.should.be.true;
          let opt = request.args[0][0];
          opt.should.have.deep.property('method', 'POST');
          opt.should.have.deep.property('formData.PatCode', '0001');
          opt.should.have.deep.property('formData.sel1', '3000');
          opt.should.have.deep.property('formData.subbut', 'Renew');
        })
    });
  })

});
