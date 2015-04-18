from __future__ import absolute_import
from celery import shared_task


from .models import UserProfile
from slh import slhapi
from oauth2client.client import OAuth2Credentials
from apiclient.discovery import build
import httplib2
import datetime
import logging
# from apiclient.http import BatchHttpRequest


logger = logging.getLogger(__name__)


class callBack(object):
    """
    Callback class for batch request
    Currently, Batch request is bugged under python3
    Therefore, the code is not used properly in this script
    """
    def __init__(self, book, http, service, cal_id):
        self.book_id = book[0]
        self.book_name = book[1]
        self.due_date = book[3]
        self.http = http
        self.service = service
        self.cal_id = cal_id
        self.body = None

    def process(self, request_id, response, exception):
        'Method that will be passed to batchrequest as callback'
        if exception is not None:
            logger.warn('Callback got exception: %s', exception)
            return
        end_date = self.due_date.replace(day=self.due_date.day+1)
        self.body = {'summary': 'Due date of {0}'.format(self.book_name),
                     'start': {'date': self.due_date.isoformat()},
                     'end': {'date': end_date.isoformat()}}
        if response['items'] == []:
            self.service.events().insert(calendarId=self.cal_id,
                                         body=self.body).execute(
                                             http=self.http)
        elif self._check_events(response['items']):
            pass
        else:
            logger.warn('Unknown situation for %s', self.book_name)

    def _check_events(self, items):
        'property method for checking if event exists and create event'
        for item in items:
            if self.book_name in item['summary']:
                if not item['start'] == self.body['start'] and \
                        item['end'] == self.body['end']:
                    # update event content
                    update = self.service.events().update(
                        calendarId=self.cal_id,
                        eventId=item['id'], body=self.body)
                    update.execute(http=self.http)
                return True
        return False


class App(object):
    """
    Main object for this script
    This will process each user's profile and auto-renew for them,
    and add/update event to user's calendar
    """
    def __init__(self, profile):
        self.account = profile.library_account
        self.password = profile.library_password
        self.credential = OAuth2Credentials.from_json(profile.credential)
        self.http = self.credential.authorize(httplib2.Http())
        self.service = build('calendar', 'v3')
        self.library_api = slhapi.library_api()

    def mainloop(self):
        'Main function of this object'
        if not self.library_api.login(self.account, self.password):
            logger.warning('%s failed to login', self.account)
            return
        self.library_api.get_reader_id()
        if not self.library_api.get_renew():
            logger.info('%s has borrowed nothing', self.account)
            return

        for book in self.library_api.book:
            diff = book[3] - datetime.date.today()
            logger.debug('Diff: %s', diff)
            if diff.days <= 3 and book[4] < 5:
                logger.info('renew %s for %s', book[1], self.account)
                if self.library_api.renew(book[0]):
                    logger.info('Renew succeed')
                else:
                    logger.warning('Failed renew')
        self.library_api.get_renew()

        # write items into calender
        now = datetime.datetime.now().isoformat().split('.')[0]+'Z'
        cal_id = self._get_calendar()

        # Batch is disabled because it will throw error under python3
        # This will be re-enabled when google have ported the library to py3
        # batch = BatchHttpRequest()

        for book in self.library_api.book:
            callback = callBack(book, self.http, self.service, cal_id)
            event = self.service.events().list(calendarId=cal_id,
                                               timeMin=now,
                                               q=book[1])
            res = event.execute(http=self.http)
            callback.process(None, res, None)

            # Uncomment the following code for usage of batch
            # batch.add(self.service.events().list(calendarId=cal_id,
            #                                      timeMin=now, q=book[1]),
            #           callback=callback.process)
        # batch.execute(http=self.http)

    def _get_calendar(self):
        """
        property function for get/create calendar
        As the code is quite long, I wrapped it into a function
        """
        page_token = None
        while True:
            calendars = self.service.calendarList().list(minAccessRole='owner',
                                                         pageToken=page_token)
            res = calendars.execute(http=self.http)
            for item in res['items']:
                if item['summary'] == 'slh autorenew reminder':
                    return item['id']
            page_token = res.get('nextPageToken')
            if not page_token:
                body = {'summary': 'slh autorenew reminder',
                        'timeZone': 'Asia/Hong_Kong'}
                pre_calendar = self.service.calendars().insert(body=body)
                res = pre_calendar.execute(http=self.http)
                body = {'id': res['id']}
                calendar = self.service.calendarList().insert(body=body)
                res = calendar.execute(http=self.http)
                return res['id']


@shared_task
def auto_renew():
    users = UserProfile.objects.filter(library_module_enabled=True)

    for user in users:
        app = App(user)
        app.mainloop()
