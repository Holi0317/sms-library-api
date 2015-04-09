from .models import UserProfile
from slh import slhapi
from apiclient.discovery import build
from apiclient.http import BatchHttpRequest
import httplib2
import datetime
import logging


logger = logging.getLogger(__name__)


class callBack(object):
    def __init__(self, book, http, service, cal_id):
        self.book_id = book[0]
        self.book_name = book[1]
        self.due_date = book[3]
        self.http = http
        self.service = service
        self.cal_id = cal_id
        self.body = None

    def process(self, request_id, response, exception):
        if exception is not None:
            logger.warn('Callback got exception: %s', exception)
            return
        end_date = self.due_date.replace(day=self.due_date.day+1)
        self.body = {'summary': 'Due date of {0}'.format(self.book_name),
                     'start': {'date': self.due_date.isoformat()},
                     'end': {'date': end_date.isoformat()}}
        if response['items'] == []:
            self.service.events.insert(calendarId=self.cal_id, body=self.body)\
                .execute(http=self.http)
        elif self.check_events(response['items']):
            pass
        else:
            logger.warn('Unknown situation for %s', self.book_name)

    def check_events(self, items):
        for item in items:
            if self.book_name in item['summary']:
                if not item['start'] == self.body['start'] and \
                        item['end'] == self.body['end']:
                    # update event content
                    update = self.service.events.update(calendarId=self.cal_id,
                                                        eventId=item['id'],
                                                        body=self.body)
                    update.execute(http=self.http)
                return True
        return False


class App(object):
    def __init__(self, profile):
        self.profile = profile
        self.account = profile.library_account
        self.password = profile.library_password
        self.credential = profile.credential
        self.http = self.credential.authorize(httplib2.Http())
        self.service = build('calendar', 'v3')
        self.library_api = slhapi.library_api()

    def mainloop(self):
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

        # write items into calender
        # Dirty hack for formatting time for google api
        now = datetime.datetime.now().isoformat().split('.')[0]+'Z'
        cal_id = self.get_calendar()
        batch = BatchHttpRequest()
        self.library_api.get_renew()
        for book in self.library_api.book:
            callback = callBack(book, self.http, self.service, cal_id)
            batch.add(self.service.events.list(calendarId=cal_id, timeMin=now,
                                               q=book[1]),
                      callback=callback.process)
        batch.execute(http=self.http)

    def get_calendar(self):
        page_token = None
        while True:
            calendars = self.service.calendarList.list(minAccessRole='owner',
                                                       page_token=page_token)
            calendars.execute(http=self.http)
            for item in calendars['items']:
                if item['summary'] == 'slh autorenew reminder':
                    return item['id']
            page_token = calendars.get('nextPageToken')
            if not page_token:
                body = {'summary': 'slh autorenew reminder',
                        'timeZone': 'Asia/Hong_Kong'}
                pre_calendar = self.service.calendars.insert(body=body)
                pre_calendar.execute()
                body = {'id': pre_calendar['id']}
                calendar = self.service.calendarList.insert(body=body)
                calendar.execute()
                return calendar['id']


def main():
    users = UserProfile.objects.execute(library_account='')\
        .execute(library_password='')

    for user in users:
        app = App.__init__(user)
        app.mainloop()
