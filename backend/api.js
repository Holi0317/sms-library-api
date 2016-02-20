/**
 * Request handler and parser for school library.
 * @module sms-library-helper/backend/api
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires request-promise
 * @requires cheerio
 * @requires iconv-lite
 * @requires bluebird
 */
'use strict';

let request = require('request-promise');
let cheerio = require('cheerio');
let iconv = require('iconv-lite');
let Promise = require('bluebird');

/**
 * Endpoints to library system.
 *
 * Some link requires language inside the link. These links contains {lang} inside them.
 * Replace {lang} to 'c' if chinese, '' if english before using them.
 * {@link sms-library-helper/backend/api~User#_formatUrl} is a helper function for this purpose.
 *
 * @const
 * @type {Object.<string, string>}
 * @see {@link sms-library-helper/backend/api~User#_formatUrl}
 */
const URLS = {
  auth: 'http://www.library.ccnet-hk.com/central/sms/schlib/admin/get_a_password.asp',
  info: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp',
  showRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp',
  saveRenew: 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp',
  mainChinese: '/central/sms/cschlib/admin/main.asp',
  mainEnglish: '/central/sms/schlib/admin/main.asp'
};

/**
 * Decode given buffer to BIG5.
 * @param {buffer} buffer - Buffer to be decoded as BIG5.
 * @returns {string} - Decoded string.
 */
function decode(buffer) {
  return iconv.decode(buffer, 'big5')
}

/**
 * Represent a borrowed book.
 *
 * @prop {string} id - ID of the book. Or, precisely, Material Code. Can be null if renew page did not provide it (probably overdued).
 * @prop {string} mcode - Material code of the book. Identical to this.id.
 * @prop {string} name - Book name. Also contains other informations like author.
 * @prop {Date} borrowDate - Borrow date.
 * @prop {Date} dueDate - Due date.
 * @prop {string} renewal - How many time has this book been renewed.
 * @constructor
 */
class Book {
  /**
   * Construct a book from table row fetched from URLS.showRenew, cheerio parsed.
   *
   * @param {object} $ - table row fetched from library, cheerio parsed.
   * @constructor
   */
  constructor($) {
    let childrens = $.children();

    this.id = $.find('input').attr('value') || null;
    this.mcode = this.id;
    this.accessionNo = null;  // TODO Ability to parse accession number.
    this.name = cheerio(childrens[1]).text();
    this.borrowDate = new Date(cheerio(childrens[2]).text());
    this.dueDate = new Date(cheerio(childrens[3]).text());
    this.renewal = cheerio(childrens[4]).text();
  }
}

/**
 * Create request-promise with resolved object.
 *
 * @param {Object} options - Object that will be passed into request-promise.
 * @returns {Promise} - Request-promise.
 */
function createReq(options) {
  return request(options);
}

/**
 * Parser and request constructor for views in library system.
 * @prop {User} self - User object that this parser is bounded to.
 * @see {@link sms-library-helper/backend/api~User}
 */
class Parser {
  /**
   * Construct parser.
   * When a view is parsed, corresponding value will be populated to the User object bounded to.
   *
   * @param {User} that - User object that this parser is bounded to.
   *
   * @constructor
   */
  constructor (that) {
    this.self = that;
  }

  /**
   * Parse auth endpoint. (URLS.auth)
   * Check for user language in library and if login failed.
   * If login failed, throw exception.
   *
   * @param {object} res - Response object from requesting URLS.auth,
   * using request-promise and set resolveWithFullResponse = true.
   *
   * @returns {Object} - Request option for info view.
   *
   * @throws {Error} - Login failed. Perhaps id or password is incorrect.
   */
  auth (res) {
    let self = this.self;
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
    return {
      uri: self._formatUrl(URLS.info),
      jar: self._jar,
      encoding: null
    };
  }

  /**
   * Parse info endpoint. (URLS.info)
   * Reader ID will be parsed at this view.
   * Meant to be chain from this.auth

   * @param {buffer} body - Buffer (un-decoded) of URLS.info response.
   * @returns {Promise} - Request of show this user's renew view. Meant to be chained with this.showRenew.
   */
  info (body) {
    let $ = cheerio.load(decode(body));
    let self = this.self;

    self.readerId = $('form[name="PATRONF"]>table font').last().text().replace(/\s/g, '');

    // Request for borrowed books
    return {
      uri: self._formatUrl(URLS.showRenew),
      jar: self._jar,
      encoding: null,
      qs: {
        PCode: self.readerId
      }
    };
  }

  /**
   * Parse showRenew view.
   * Borrowed books will be parsed and populated here.
   *
   * @param {buffer} body - Buffer (un-decoded) response from show renew view.
   * @returns {Promise} - Promise resolved with nothing.
   */
  showRenew (body) {
    let self = this.self;
    let $ = cheerio.load(decode(body));
    self.borrowedBooks = [];

    $('form tr:not(:first-child)').each(function () {
      let book = new Book(cheerio(this));
      self.borrowedBooks.push(book)
    });

    return Promise.resolve();
  }
}

/**
 * User represnets a user inside the library system.
 * @prop {request.jar} _jar - Cookie jar for this user. Private.
 * @prop {Parser} parser - Parser for this user, bounded to this. Private.
 * @prop {string} language - language this user used in library system. Must be either 'chinese' or 'english'.
 * @prop {string} id - Login ID of the user.
 * @prop {string} readerId - ID (Patron Code) of the user. Can be converted to Number,
 * but remains as string. Because, whatever.
 * @prop {Book[]} borrowedBooks - Borrowed books.
 */
class User {
  /**
   * Construct the User
   * @constructor
   */
  constructor () {
    this._jar = request.jar();
    this.parser = new Parser(this);

    this.language = null;
    this.id = null;
    this.readerId = null;
    this.borrowedBooks = [];
  }

  /**
   * Pre-process url and inject language to url. Some url requires language.
   *
   * @param {string} url - Url to be pre-processed.
   * @returns {string} - Processed url. {lang} has been properly replaced with user language.
   *
   * @see {@link sms-library-helper/backend/api.URLS}
   * @private
   */
  _formatUrl (url) {
    if (this.language === 'chinese') {
      return url.replace(/\{lang\}/, 'c');
    } else if (this.language === 'english') {
      return url.replace(/\{lang\}/, '');
    } else {
      throw new Error('language has not been defined');
    }
  }


  /**
   * Login this user with given id and password.
   * After login, reader id and borrowed books will be parsed and populated.
   *
   * @param {string} id - Login id of the user. This will be saved in this.id.
   * @param {string} passwd - Login password of the user.
   * Password will NOT be saved due to security reason.
   *
   * @returns {Promise} - Promise that will login and parse all the required informations.
   * Result of Promise should be nothing.
   *
   * @see {@link sms-library-helper/backend/api~Parser}
   */
  login (id, passwd) {
    this.id = id;
    let options = {
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
    .then(createReq)
    .then(this.parser.info.bind(this.parser))
    .then(createReq)
    .then(this.parser.showRenew.bind(this.parser));
  }

  /**
   * Send login request and check if given id and password is valid.
   * If it is invalid, the promise will be rejected.
   *
   * @param {string} id - Login id of the user.
   * @param {string} passwd - Login password of the user.
   *
   * @returns {Promise} - Promise that will be resolved if id and password is valid.
   * Rejected if it is incorrect.
   */
   checkLogin(id, passwd) {
     this.id = id;

     let options = {
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
     .then(() => {return Promise.resolve()});   // Supress result of previous action.
   }

  /**
   * Reload borrowed books.
   *
   * @returns {Promise} - Request and parse for books. Result should be nothing.
   * Access reloaded borred book from property of this.
   * @throws {error} - Not logined.
   */
  reload () {
    if (!this.id) {
      throw new Error('Not logined.');
    }

    let options = {
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

  /**
   * Renew one book. If that failed, no error will be thrown as this does not check if renew is succeed.
   * Also, borrowed books will not be reloaded. Reload it if you need to.
   *
   * @param {Book} book - The book to be renewed.
   * @returns {Promise} - Promise to renew that book. Response from server will be the
   * promise's result.
   */
  renewBook (book) {
    if (!this.id) {
      throw new Error('Not logined.');
    }

    if (!book.id) {
      throw new Error('Book ID is not defined.');
    }

    let options = {
      uri: this._formatUrl(URLS.saveRenew),
      jar: this._jar,
      encoding: null,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        PatCode: this.readerId,
        sel1: book.id,
        subbut: 'Renew'
      }
    };

    return request(options);
  }

}

module.exports = User;
module.exports._URLS = URLS;
module.exports._Book = Book;
module.exports._Parser = Parser;

// Inject jq command, for debugging selector
// var jq = document.createElement('script');jq.src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js";document.getElementsByTagName('head')[0].appendChild(jq);
