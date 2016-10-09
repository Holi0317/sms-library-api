import * as google from 'googleapis';
import * as Promise from 'bluebird';

global.Promise = Promise;

// Promisify some globals.
Promise.promisifyAll(google.auth.OAuth2.prototype);

let plus = google.plus('v1');
let gmail = google.gmail('v1');

type plusPeopleGetType = (options: { userId: string, auth: google.auth.OAuth2 }) => Promise<{emails: { value: string, type: string }[], displayName: string, id: string}>

export const plusPeopleGet: plusPeopleGetType = Promise.promisify(plus.people.get);
export const gmailSend = Promise.promisify(gmail.users.messages.send);
export const calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

