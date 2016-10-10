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
      refreshAccessTokenAsync(): Promise<void>;
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

  type calendarList = {
    summary: string
    id: string
  }

  type calendarEvent = {
    summary: string
    id?: string
    end: {
      date: string
      timeZone: string
    }
    start: {
      date: string
      timeZone: string
    }
  }

  interface APICalendar {
    calendarList: {
      listAsync(options: {
        auth: auth.OAuth2
        maxResults: number
        showHidden: boolean
        minAccessRole: string
      }): Promise<{
        nextPageToken: string
        items: calendarList[]
      }>
    }

    calendars: {
      insertAsync(options: {
        auth: auth.OAuth2,
        resource: {
          summary: string
          timeZone: string
        }
      }): Promise<{
        id: string
      }>
    }
    events: {
      listAsync(options: {
        auth: auth.OAuth2
        calendarId: string
        timeZone: string
        maxResults: number
      }): Promise<{
        nextPageToken: string
        items: calendarEvent[]
      }>,

      insertAsync(options: {
        auth: auth.OAuth2
        calendarId: string
        resource: calendarEvent
      }): Promise<void>,

      deleteAsync(options: {
        auth: auth.OAuth2
        calendarId: string
        eventId: string
      }): Promise<void>
    }
  }

  export function plus(version: string): APIPlus
  export function gmail(version: string): APIGmail
  export function calendar(version: string): APICalendar

}