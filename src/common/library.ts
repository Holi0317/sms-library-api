import * as request from 'request';
import * as rp from 'request-promise-native';
import * as parsers from './library-parser';

/**
 * Endpoints to library system.
 *
 * Some link requires language inside the link. These links contains {lang} inside them.
 * Replace {lang} to 'c' if chinese, '' if english before using them.
 * {@link sms-library-helper/backend/library~User#_formatUrl} is a helper function for this purpose.
 *
 * @const
 */
export const URLS = {
  login: 'http://sms.library.ccnet-hk.com/cschlib/admin/login.asp',
  auth: 'http://sms.library.ccnet-hk.com/schlib/admin/get_a_password.asp',
  info: 'http://sms.library.ccnet-hk.com/{lang}schlib/patron/patronr.asp',
  showRenew: 'http://sms.library.ccnet-hk.com/{lang}schlib/patron/showRenew.asp',
  saveRenew: 'http://sms.library.ccnet-hk.com/{lang}schlib/patron/saveRenew.asp',
  mainChinese: '/cschlib/admin/main.asp',
  mainEnglish: '/schlib/admin/main.asp'
};

/**
 * Represent a borrowed book.
 *
 * @prop {string} mcode - Material code of the book. Can be null if renew page did not provide it (probably overdued).
 * @prop {string} name - Book name. Also contains other informations like author.
 * @prop {Date} borrowDate - Borrow date.
 * @prop {Date} dueDate - Due date.
 * @prop {Number} renewal - How many time has this book been renewed.
 */
export interface Book {
  mcode?: string;
  name: string;
  borrowDate: Date;
  dueDate: Date;
  renewal: Number;
}

/**
 * User represents a user inside the library system.
 * @prop fetch - Fetch client for the user
 * @prop language - language this user used in library system. Must be either 'chinese' or 'english'.
 * @prop id - Login ID of the user.
 * @prop readerID - ID (Patron Code) of the user. Can be converted to Number,
 * but remains as string. Because, whatever.
 * @prop borrowedBooks - Borrowed books.
 */
export default class User {
  private jar = request.jar();
  private request = rp.defaults({
    resolveWithFullResponse: true,
    jar: this.jar
  });
  public language?: 'chinese'|'english' = null;
  public id?: string = null;
  public readerID?: string = null;
  public borrowedBooks: Book[] = [];

  constructor() { }

  /**
   * Pre-process url and inject language to url. Some url requires language.
   *
   * @param {string} url - Url to be pre-processed.
   * @returns {string} - Processed url. {lang} has been properly replaced with user language.
   *
   * @see {@link sms-library-helper/backend/library.URLS}
   * @private
   */
  private formatUrl(url: string) {
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
   * @see {@link sms-library-helper/backend/library~Parser}
   */
  async login(id: string, passwd: string) {
    await this.checkLogin(id, passwd);
    await this.fetchReaderID();
    await this.reload();
  }

  private async fetchReaderID() {
    let res = await this.request({
      uri: this.formatUrl(URLS.info)
    });
    this.readerID = parsers.info(res);
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
  async checkLogin(id: string, passwd: string) {
    this.id = id;
    let res = await this.request({
      uri: URLS.auth,
      qs: {
        UserID: id,
        Passwd: passwd
      }
    });
    this.language = parsers.login(res);
  }

  /**
   * Reload borrowed books.
   *
   * @returns {Promise} - Request and parse for books. Result should be nothing.
   * Access reloaded borred book from property of this.
   * @throws {error} - Not logined.
   */
  async reload() {
    if (!this.id) {
      throw new Error('Not logined.');
    }

    let res = await this.request({
      uri: this.formatUrl(URLS.showRenew),
      qs: {
        PCode: this.readerID
      }
    });

    this.borrowedBooks = parsers.showRenew(res);
  }

  /**
   * Renew one book. If that failed, no error will be thrown as this does not check if renew is succeed.
   * Also, borrowed books will not be reloaded. Reload it if you need to.
   *
   * @param {Book} book - The book to be renewed.
   * @returns {Promise} - Promise to renew that book. Response from server will be the
   * promise's result.
   */
  async renewBook(book: Book) {
    if (!this.id) {
      throw new Error('Not logined.');
    }

    if (!book.mcode) {
      throw new Error('Book ID (mcode) is not defined.');
    }

    await this.request({
      uri: this.formatUrl(URLS.saveRenew),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        PatCode: this.readerID,
        sel1: book.mcode,
        subbut: 'Renew'
      }
    });
  }

}
