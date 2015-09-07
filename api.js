// Library API for school library
'use strict';

var request = require('request-promise');
var cheerio = require('cheerio');

var URLS = {
  auth: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/admin/get_a_password.asp',
  info: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp',
  showRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp',
  saveRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp',
  mainChinese: 'http://www.library.ccnet-hk.com/central/sms/cschlib/admin/main.asp',
  mainEnglish: 'http://www.library.ccnet-hk.com/central/sms/schlib/admin/main.asp',
};

var book = function (id, name, borrowDate, dueDate, renewal) {
  // Book object constructor
  this.id = id;
  this.name = name;
  this.borrowDate = borrowDate;
  this.dueDate = dueDate;
  this.renewal = renewal;
};

module.exports = function () {
  this._jar = request.jar();
  this.language = null;
  this.id = null;
  this.readerId = null;
  this.borrowedBooks = null;

  this._formatUrl = function (url) {
    if (this.language === 'chinese') {
      return url.replace(/\{lang\}/, 'c');
    } else if (this.language === 'english') {
      return url.replace(/\{lang\}/, '');
    } else {
      throw 'language has not been defined';
    }
  }.bind(this);

  this.login = function (id, passwd) {
    // Login user with given id and passwd.
    // Save id in this.id
    // Also get reader id and borrowed book.
    // Return promise object.
    this.id = id;
    var options = {
      uri: URLS.auth,
      jar: this._jar,
      encoding: 'big5',
      qs: {
        UserID: id,
        Passwd: passwd,
      },
      resolveWithFullResponse: true,
    };

    return request(options)
    .then(function (res) {
      // Check user language, or failed
      switch (res.request.uri) {
        case URLS.mainChinese:
        this.language = 'chinese';
        break;
        case URLS.mainEnglish:
        this.language = 'english';
        break;
        default:
        throw 'Login failed';
      }

      // Request for user record
      var options = {
        uri: this._formatUrl(URLS.info),
        jar: this._jar,
        encoding: 'big5',
      };
      return request(options);
    })
    .then(function (body) {
      // Get reader ID
      var $ = cheerio.load(body);
      this.readerId = $('form[name="PATRONF"]>table font').last().text().replace(/\s/g, "");

      // Request for borrowed books
      var options = {
        uri: this._formatUrl(URLS.showRenew),
        jar: this._jar,
        encoding: 'big5',
      };
    })
    .then(function (body) {
      // TODO fetch borrowed books, save them in this.borrowedBooks using book object
      // I got no book borrowed >.>. So I cannot implement this yet

    });
  }.bind(this);

  this.renewBook = function (bookId) {
    // Renew one book, with given book id or book object.
    // TODO: Accept more than one book as param
    if (!this.id) {
      throw 'Not logined.';
    }
    if (bookId.id) {
      // Given param is book object
      bookId = bookId.id;
    }

    var options = {
      uri: this._formatUrl(URLS.saveRenew),
      jar: this._jar,
      encoding: 'big5',
      method: 'POST',
      formData: {
        PatCode: this.id,
        sel1: bookId,
        subbut: 'Renew',
      }
    };

    return request(options)
    .then(function (body) {
      // Check if succeed
      // TODO
    });
  }.bind(this);

};


// Inject jq command, for debugging selector
// var jq = document.createElement('script');jq.src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";document.getElementsByTagName('head')[0].appendChild(jq);
