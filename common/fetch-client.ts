import * as fetch from 'node-fetch';
import * as querystring from 'querystring';
import {CookieJar} from 'tough-cookie';

interface fetchOpt {
  qs?: any;
  method?: 'GET'|'POST'|'PUT'|'DELETE';
  headers?: any;
  body?: ArrayBuffer | ArrayBufferView | Blob | FormData | string;
  mode?: 'same-origin' | 'no-cors' | 'cors';
  redirect?: 'follow' | 'error' | 'manual';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
}

export class FetchClient {
  private cookie = new CookieJar();
  constructor() {}

  private getCookie(currentUrl: string) {
    return new Promise((resolve, reject) => {
      this.cookie.getCookieString(currentUrl, (err, cookie) => {
        if (err) return reject(err);
        return resolve(cookie);
      })
    });
  }

  private setCookie(cookie: string, currentUrl: string) {
    return new Promise((resolve, reject) => {
      this.cookie.setCookie(cookie, currentUrl, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async fetch(url: string, opts: fetchOpt = {}) {
    opts.headers = opts.headers || {};
    opts.headers.cookie = await this.getCookie(url);
    if (opts.qs) {
      url += `?${querystring.stringify(opts.qs)}`;
      opts.qs = undefined;
    }
    let res = await fetch(url, opts);
    let cookies = res.headers.getAll('set-cookie');
    for (let cookie of cookies) {
      await this.setCookie(cookie, url);
    }
    return res;
  }
}