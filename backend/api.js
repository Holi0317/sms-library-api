// Library API for school library
'use strict';

var request = require('request-promise');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

const URLS = {
  auth: 'http://www.library.ccnet-hk.com/central/sms/schlib/admin/get_a_password.asp',
  info: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp',
  showRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp',
  saveRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp',
  mainChinese: '/central/sms/cschlib/admin/main.asp',
  mainEnglish: '/central/sms/schlib/admin/main.asp'
};

function decode(buffer) {
  /*
  * Decode buffer as big5 and return string
  * @param (buffer) buffer: buffer object to be decoded.
  * @return (String): decoded string.
  */
  return iconv.decode(buffer, 'big5')
}

function Book ($) {
  // Construct Book object by cheerio object.
  var childrens = $.children()

  this.id = $.find('input').attr('value') || null;
  this.name = cheerio(childrens[1]).text();
  this.borrowDate = new Date(cheerio(childrens[2]).text());
  this.dueDate = new Date(cheerio(childrens[3]).text());
  this.renewal = cheerio(childrens[4]).text();
}

class Parser {
  /*
  * Parser for different pages
  */
  constructor (that) {
    this.self = that;
  }

  auth (res) {
    // Link: URLS.auth
    // Check user language, or failed
    var self = this.self;
    switch (res.request.uri.pathname) {
      case URLS.mainChinese:
        self.language = 'chinese';
        break;
      case URLS.mainEnglish:
        self.language = 'english';
        break;
      default:
        throw new Error('Cannot login library system. Is id and password correct?');
    }

    // Request for user record
    var options = {
      uri: self._formatUrl(URLS.info),
      jar: self._jar,
      encoding: null
    };

    return request(options);
  }

  info (body) {
    // Link: URLS.info
    // Get reader ID
    var $ = cheerio.load(decode(body));
    var self = this.self;

    self.readerId = $('form[name="PATRONF"]>table font').last().text().replace(/\s/g, '');

    // Request for borrowed books
    var options = {
      uri: self._formatUrl(URLS.showRenew),
      jar: self._jar,
      encoding: null,
      qs: {
        PCode: self.readerId
      }
    };

    return request(options);
  }

  showRenew (body) {
    // Parse showRenew response.
    var self = this.self;
    var $ = cheerio.load(decode(body));
    self.borrowedBooks = [];

    $('form tr:not(:first-child)').each(function () {
      var book = new Book(cheerio(this));
      self.borrowedBooks.push(book)
    });

    return;
  }
}

module.exports = class {
  /*
  * Constructor function for api
  */
  constructor () {
    this._jar = request.jar();
    this.language = null;
    this.id = null;
    this.readerId = null;
    this.borrowedBooks = [];
    this.parser = new Parser(this);
  }

  _formatUrl (url) {
    if (this.language === 'chinese') {
      return url.replace(/\{lang\}/, 'c');
    } else if (this.language === 'english') {
      return url.replace(/\{lang\}/, '');
    } else {
      throw new Error('language has not been defined');
    }
  }


  login (id, passwd) {
    /*
    * Login user with given id and passwd.
    * Save id in this.id
    * Also get reader id and borrowed book.
    * @return: Promise object, only handle error and .done. i.e., do not .then it.
    */
    this.id = id;
    var options = {
      uri: URLS.auth,
      jar: this._jar,
      qs: {
        UserID: id,
        Passwd: passwd
      },
      resolveWithFullResponse: true
    };

    return request(options)
    .then(this.parser.auth.bind(this.parser))
    .then(this.parser.info.bind(this.parser))
    .then(this.parser.showRenew.bind(this.parser));
  }

  reload () {
    // Reload borrowed books data.
    if (!this.id) {
      throw new Error('Not logined.');
    }

    var options = {
      uri: this._formatUrl(URLS.showRenew),
      jar: this._jar,
      encoding: null,
      qs: {
        PCode: this.readerId
      }
    };

    return request(options)
    .then(this.parser.showRenew.bind(this.parser));
  }

  renewBook (book) {
    /*
    * Renew one book, with given book object.
    * @return promise
    * please .then the promise
    */
    if (!this.id) {
      throw new Error('Not logined.');
    }

    var options = {
      uri: this._formatUrl(URLS.saveRenew),
      jar: this._jar,
      encoding: null,
      method: 'POST',
      formData: {
        PatCode: this.id,
        sel1: book.id,
        subbut: 'Renew'
      }
    };

    return request(options)
  }

}

// Inject jq command, for debugging selector
// var jq = document.createElement('script');jq.src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";document.getElementsByTagName('head')[0].appendChild(jq);
