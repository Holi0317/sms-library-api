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
      setCredentials(tokens: credentials): void;
      revokeCredentials(callback: (err?: Error) => void): void;
      generateAuthUrl(option: {
        access_type: 'online'|'offline',
        scope: string[]
      }): string;
      getTokenAsync(code: string): Promise<credentials>;
      revokeCredentialsAsync(): Promise<void>;
    }
  }

  interface APIPlus {
    people: {
      get(options: {
        userId: string,
        auth: auth.OAuth2
      }): Promise<{
        emails: {
          value: string,
          type: string
        }[],
        displayName: string,
        id: string
      }>
    }
  }

  interface APIGmail {
    users: {
      messages: {
        send(): void
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

  export function plus(version: string): APIPlus
  export function gmail(version: string): APIGmail
  export function calendar(version: string): APICalendar

}