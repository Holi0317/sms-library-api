// Minimal google API typescript declaration file for this project.
// Will be removed once https://github.com/google/google-api-nodejs-client/issues/503 is resolved
declare module 'googleapis' {

  export namespace auth {
    interface credentials {
      access_token: string
      refresh_token?: string
    }
    export class JWT {
      constructor(email: string, keyFile: string|null, key: string, scopes: string|string[], subject: string|null);
      authorize(callback: (err?: Error) => void): void;
    }
    export class OAuth2 {
      constructor(clientId: string, clientSecret: string, redirectUri: string, opt_opts?: any)
      setCredentials(tokens: credentials);
      revokeCredentials(callback: (err?: Error) => void): void;
    }
  }

  interface APIPlus {
    people: {
      get()
    }
  }

  interface APIGmail {
    users: {
      messages: {
        send()
      }
    }
  }

  interface APICalendar {
    calendarList: {

    }

    calendars: {

    }
    events: {

    }
  }

  export function plus(version='v1'): APIPlus
  export function gmail(version='v1'): APIGmail
  export function calendar(version='v3'): APICalendar

}