import {calendar} from '../common/promisify';
import {TIMEZONE} from '../constants';
import {CronUserData} from '../cron-user-data';

async function createCalendar(user: CronUserData) {
  if (!user.data.renewEnabled || user.failed || !user.data.calendarEnabled) {
    return;
  }

  try {
    let cal = await calendar.calendars.insertAsync({
      auth: user.oauth2client,
      resource: {
        summary: user.data.calendarName,
        timeZone: TIMEZONE
      }
    });

    user.log(`Calendar created. ID: ${cal.id}.`, 'DEBUG');
    user.calendarID = cal.id;
    return;

  } catch (err) {
    user.calendarID = null;
    console.error('Error when creating new calendar. Error: ', err);
    user.log('Cannot create calendar / Insert calendar to CalendarList. Aborting', 'FATAL');
    user.failed = true;
    return;
  }

}

export async function getCalendar(user: CronUserData) {
  if (!user.data.renewEnabled || user.failed || !user.data.calendarEnabled) {
    return
  }

  let res: {
    nextPageToken: string
    items: {
      summary: string
      id: string
    }[]
  };

  try {
    res = await calendar.calendarList.listAsync({
      auth: user.oauth2client,
      maxResults: 250,
      showHidden: true,
      minAccessRole: 'writer'
    });
  } catch (err) {
    console.error('Error when trying to list calendar. Error: ', err);
    user.log('Cannot list Google Calendar. Aborting.', 'FATAL');
    user.failed = true;
    return;
  }

  if (res.nextPageToken) {
    user.log('Found there is more than 250 items in calendar list. A new calendar may be created.', 'WARN');
  }

  for (let item of res.items) {
    if (item.summary === user.data.calendarName) {

      // Got calendar that I want.
      user.calendarID = item.id;
      user.log(`Found Google Calendar. ID: ${item.id}.`, 'DEBUG');
      return;

    }
    // Else, continue.
  }

  // Calendar not found. Lets create one.
  user.log(`Cannot find Google Calendar with name "${user.data.calendarName}". Creating one.`);
  await createCalendar(user);
}