import * as fetch from 'node-fetch';
import * as querystring from 'querystring';

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
  private cookie = '';
  constructor() {}

  async fetch(url: string, opts: fetchOpt = {}) {
    if (opts.headers) {
      opts.headers = {};
    }
    if (opts.qs) {
      url += `?${querystring.stringify(opts.qs)}`;
      opts.qs = undefined;
    }
    opts.headers.cookie = this.cookie;
    let res = await fetch(url, opts);
    // TODO Set cookies
    return res;
  }
}