'use strict';

let Promise = require('bluebird');
let {calendar} = require('../promisify');
let {BreakSignal, diff} = require('../utils');
let {TIMEZONE} = require('../constants');

/**
 * Convert Date object to Google calendar's format, 'yyyy-mm-dd'.
 *
 * @param {Date} date - Date object to be converted.
 *
 * @returns {string} - Date with yyyy-mm-dd as format.
 */
function dateToGoogle(date) {
  return `${date.getFullYear()}-${('0' + (date.getMonth()+1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`
}

function createEventResource(book) {
  let date = dateToGoogle(book.dueDate);

  return {
    summary: `Due date for book ${book.name}. ID: ${book.id}`,
    start: {
      date: date,
      timeZone: TIMEZONE
    },
    end: {
      date: date,
      timeZone: TIMEZONE
    }
  };
}

module.exports = function(user) {
  if (!user.data.renewEnabled || user.failed || !user.data.calendarEnabled) {
    return Promise.resolve();
  }

  let promises = [];
  let touchedEvents = [];
  let logUpdated = [];
  let logCreated = [];

  return user.library.reload.bind(user.library)()
    .catch(err => {
      if (err instanceof BreakSignal) {
        throw err;
      }
      console.error('Error when reloading library contents. Error: ', err);
      user.failed = true;
      user.log('Cannot reload library contents. WTF? This should not happen. Aborting', 'FATAL');
      throw new BreakSignal();
    })
    .then(() => {
      // List events in calendar
      return calendar.events.listAsync({
        auth: user.oauth2client,
        calendarId: user.calendarID,
        timeZone: TIMEZONE,
        maxResults: 2500
      });
    })
    .catch(err => {
      if (err instanceof BreakSignal) {
        throw err;
      }
      console.error('Error when listing events in Google Calendar. Error: ', err);
      user.failed = true;
      user.log('Cannot listing events in Google Calendar. Aborting.', 'FATAL');
      throw new BreakSignal();
    })
    .then(events => {

      if (events.nextPageToken) {
        user.log('More than 2500 events found in calendar (Seriously?). Some event may be missed out.', 'WARN');
      }

      for (let book of user.library.borrowedBooks) {
        if (book.id === null) {
          // Book does not have id. Probably overdued.
          continue;
        }

        // Event resource for requesting
        let resource = createEventResource(book);
        let inCalendar = false;

        for (let event of events.items) {   // For each event.
          let resDate = resource.end.date;
          if (event.summary === resource.summary) {   // Is this event the one I want for this book?
            if (event.end.date !== resDate || event.start.date !== resDate) {   // Has event date changed? (renewed/touched?)
              promises.push(calendar.events.updateAsync({
                auth: user.oauth2client,
                calendarId: user.calendarID,
                eventId: event.id,
                resource: resource
              }));
            }
            touchedEvents.push(event.id);
            inCalendar = true;  // Already in Calendar
          }
        }

        // The book is not in Google Calendar. Create a new one.
        if (!inCalendar) {
          promises.push(calendar.events.insertAsync({
            auth: user.oauth2client,
            calendarId: user.calendarID,
            resource: resource
          }));

          logCreated.push(book.name);

        }

      }

      // Cleanup events that has not been touched (Illegal events or returned books)
      let allEventsID = events.items.map(item => {
        return item.id;
      });
      let removes = diff(allEventsID, touchedEvents);
      for (let eventID of removes) {
        promises.push(calendar.events.deleteAsync({
          auth: user.oauth2client,
          calendarId: user.calendarID,
          eventId: eventID
        }));
      }

      if (logUpdated.length) {
        user.log(`Calendar event(s) of the following books will be updated: ${logUpdated.join(', ')}`);
      }
      if (logCreated.length) {
        user.log(`Calendar event(s) of the following books will be created: ${logCreated.join(', ')}`);
      }
      if (removes.length) {
        user.log(`The following event(s) will be removed: ${removes.join(', ')}`, 'DEBUG');
      }

      return Promise.all(promises);

    });
};