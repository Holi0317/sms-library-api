import * as google from 'googleapis';
import * as Promise from 'bluebird';

global.Promise = Promise;

// Promisify some globals.
Promise.promisifyAll(google.auth.OAuth2.prototype);

let plus = google.plus('v1');
let gmail = google.gmail('v1');

type plusPeopleGetType = (options: { userId: string, auth: google.auth.OAuth2 }) => Promise<{emails: { value: string, type: string }[], displayName: string, id: string}>
type gmailSendType = (options: {
  auth: google.auth.JWT
  userId: string
  resource: {
    raw: string
  }
}) => Promise<void>;

export const plusPeopleGet: plusPeopleGetType = Promise.promisify(plus.people.get);
export const gmailSend: gmailSendType = Promise.promisify(gmail.users.messages.send);
export const calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

