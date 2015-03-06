#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

import urllib
from http import cookiejar
import re
import datetime
import logging

AUTH_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/admin/get_a_password.asp'
GET_READER_ID_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp'
RENEW_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp?PCode={code}'
RENEW_BOOK_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp'

logger = logging.getLogger(__name__)


class library_api(object):
    def __init__(self):
        # create cookiejar for cookie
        logger.debug('Initializing api')
        self.cj = cookiejar.CookieJar()
        processor = urllib.request.HTTPCookieProcessor(self.cj)
        self.opener = urllib.request.build_opener(processor)
        urllib.request.install_opener(self.opener)
        self.is_chinese = False
        self.info = {}
        self.book = []
        return

    def url_formatter(self, src):
        """
        In-class url formatter
        return the url formatted with the correct language
        ment to be used in class only
        """
        if self.is_chinese:
            return src.format(lang='c')
        else:
            return src.format(lang='')

    def login(self, id, passwd):
        """
        Authoration process
        Must be done before any other process
        Store self.is_chinese for the language
        return bool for successful of login
        """
        value = {'UserID': id, 'Passwd': passwd}
        data = urllib.parse.urlencode(value).encode('utf-8')
        url = self.url_formatter(AUTH_URL)
        req = urllib.request.Request(url, data)

        with urllib.request.urlopen(req) as k:
            redirect = k.geturl()
            i = k.read().decode('big5')
        login_fail = re.search(r'login\.UserID\.focus', i)
        if login_fail:
            logger.debug('Login Failed')
            return False
        else:
            logger.debug('Login succeed')
            search = re.search(r'central/sms/cschlib/admin/main.asp', redirect)
            if search:
                self.is_chinese = True
                logger.debug('User is Chinese')
            else:
                self.is_chinese = False
                logger.debug('User is not Chinese')
            return True

    def get_reader_id(self):
        """
        Store the reader informations into self.info
        Remained get_reader_id as the name for backward compability
        """
        url = self.url_formatter(GET_READER_ID_URL)
        with urllib.request.urlopen(url) as r:
            raw = r.read().decode('big5')
        self.info['reader_id'] = int(re.search(r"PCode=(\d+)'", raw).group(1))
        if self.is_chinese:
            self.info['login_name'] = re.search(r"登入名稱.+?<TD>(.+?)</TD>",
                                                raw, re.DOTALL).group(1)
            self.info['student_no'] = re.search(r"學生編號.+?<TD>(.+?)</TD>",
                                                raw, re.DOTALL).group(1)
            self.info['class'] = re.search(r"班別</font.+?<TD>(.+?)</TD>",
                                           raw, re.DOTALL).group(1)
            self.info['class_no'] = re.search(r"班號</font.+?<TD>(.+?)</TD>",
                                              raw, re.DOTALL).group(1)
        else:
            self.info['login_name'] = re.search(r"Login Name.*?<TD>(.+?)</TD>",
                                                raw, re.DOTALL).group(1)
            self.info['student_no'] = re.search(r"Student No.+?<TD>(.+?)</TD>",
                                                raw, re.DOTALL).group(1)
            self.info['class'] = re.search(r"Class</font.+?<TD>(.+?)</TD>",
                                           raw, re.DOTALL).group(1)
            self.info['class_no'] = re.search(r"Class No\.</font.+?<TD>(.+?)</TD>",
                                              raw, re.DOTALL).group(1)

        logger.debug('Informations: {0}'.format(self.info))
        return

    def get_renew(self):
        """
        Get renew infornations
        Store in self.book, as a list
        format is [id_of_the_book, name_of_the_book, borrow_date, due_date,
            renewal]
        """
        if self.info == {}:
            self.get_reader_id()
        if self.is_chinese:
            url = RENEW_URL.format(lang='c', code=self.info['reader_id'])
        else:
            url = RENEW_URL.format(lang='', code=self.info['reader_id'])
        with urllib.request.urlopen(url) as r:
            raw = r.read().decode('big5')
        search = re.search(r'<TR>.*</TR></TABLE><P><P>', raw)
        if search:
            raw_data = search.group()
        else:
            return False

        value_list = [i.group(1) for i in re.finditer(r'value=(\d+)', raw_data)]
        title_list = [i.group(1) for i in re.finditer(r"<td width='45%'.*?>(.*?)</td>", raw_data)]
        renewal = [i.group(1) for i in re.finditer(r"<td width='10%'.*?>(.*?)</td>", raw_data)]
        dates = [datetime.date(int(i.group(1)), int(i.group(2)),
                               int(i.group(3))) for i in re.finditer(
                                   r"<td width='20%'.*?>(\d{4}?)/(\d{1,2}?)/(\d{1,2}?)</td>",
                                   raw_data)]

        len_date = []
        return_date = []
        for i in range(1, len(dates)+1):
            if i % 2 == 1:
                len_date.append(dates[i-1])
            else:
                return_date.append(dates[i-1])

        for i in range(len(value_list)):
            book = [int(value_list[i]), title_list[i], len_date[i],
                    return_date[i], int(renewal[i])]
            self.book.append(book)
        logger.debug('Book: {0}'.format(self.book))
        return True

    def renew(self, book_id):
        """
        renew book
        can only renew one book at a time
        will not reflesh data
        Will return a bool for result
        """
        logger.debug('book id: {0}'.format(book_id))
        url = self.url_formatter(RENEW_BOOK_URL)
        value = {'PatCode': self.info['reader_id'], 'sel1': book_id,
                 'subbut': 'Renew'}
        data = urllib.parse.urlencode(value).encode('utf-8')
        req = urllib.request.Request(url, data)
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode('big5')
        if self.is_chinese:
            failed = re.search(r"已超越預借限額", raw)
        else:
            failed = re.search(r"exceeded the renewal limit", raw)
        if failed:
            return False
        else:
            return True
