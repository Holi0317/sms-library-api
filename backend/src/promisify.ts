import * as google from 'googleapis';
import * as Promise from 'bluebird';

// Promisify some globals.
Promise.promisifyAll(google.auth.OAuth2.prototype);

let plus = google.plus('v1');
let gmail = google.gmail('v1');

export const plusPeopleGet = Promise.promisify(plus.people.get);
export const gmailSend = Promise.promisify(gmail.users.messages.send);
export const calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

