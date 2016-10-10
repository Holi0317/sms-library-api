declare module 'tough-cookie' {
  interface setCookieOption {
    http: boolean
    secure: boolean
    now: Date
    ignoreError: boolean
  }
  type setCookieCB = (err: Error, cookie: CookieJar) => void;
  type getCookieCB = (err: Error, cookies: string) => void;
  export class CookieJar {
    constructor()
    setCookie(cookieOrString: string | Cookie, currentUrl: string, cb: setCookieCB): void;
    setCookie(cookieOrString: string | Cookie, currentUrl: string, options: setCookieOption, cb: setCookieCB): void;

    getCookieString(currentUrl: string, cb: getCookieCB);
  }
  export class Cookie {
    constructor()
  }
}