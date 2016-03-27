/**
 * Promisify some functions.
 * This prevents re-promisify functions and save some resource.
 * @module sms-library-helper/backend/promisify
 * @author Holi0317 <holliswuhollis@gmail.com>
 * @license MIT
 *
 * @requires bluebird
 * @requires googleapis
 */

'use strict'

let google = require('googleapis');
let Promise = require('bluebird');

// Promisify some globals.
Promise.promisifyAll(google.auth.OAuth2.prototype);

let plus = google.plus('v1');

let calendar = google.calendar('v3');
Promise.promisifyAll(calendar.calendarList);
Promise.promisifyAll(calendar.calendars);
Promise.promisifyAll(calendar.events);

module.exports = {
  plusPeopleGet: Promise.promisify(plus.people.get),
  calendar: calendar
}
