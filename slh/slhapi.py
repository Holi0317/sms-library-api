#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

import re
import datetime
import logging
import requests

AUTH_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/admin/get_a_password.asp'
GET_READER_ID_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp'
RENEW_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp'
RENEW_BOOK_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp'
LOGIN_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/admin/login.asp'

logger = logging.getLogger(__name__)


class library_api(object):
    def __init__(self):
        logger.debug('Initializing api')
        self.session = requests.Session()
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
        payload = {'UserID': id, 'Passwd': passwd}
        url = self.url_formatter(AUTH_URL)

        req = self.session.get(url, params=payload)
        req.encoding = 'big5'

        if check_login_fail(req.url):
            logger.debug('Login Failed')
            return False
        else:
            logger.debug('Login succeed')
            search = re.search(r'central/sms/cschlib/admin/main.asp', req.url)
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
        req = self.session.get(url)
        req.encoding = 'big5'
        raw = req.text
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
        url = self.url_formatter(RENEW_URL)
        payload = {'PCode': self.info['reader_id']}
        req = self.session.get(url, params=payload)
        req.encoding = 'big5'
        search = re.search(r'<TR>.*</TR></TABLE><P><P>', req.text)
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
        payload = {'PatCode': self.info['reader_id'], 'sel1': book_id,
                 'subbut': 'Renew'}
        req = self.session.post(url, data=payload)
        req.encoding = 'big5'
        if self.is_chinese:
            failed = re.search(r"已超越預借限額", req.text)
        else:
            failed = re.search(r"exceeded the renewal limit", req.text)
        if failed:
            return False
        else:
            return True


def check_login_fail(url):
    logger.debug(url)
    chinese_url = LOGIN_URL.format(lang='c')
    eng_url = LOGIN_URL.format(lang='')
    if url == chinese_url or url == eng_url:
        return True
    else:
        return False
