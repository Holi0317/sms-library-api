#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import urllib
from http import cookiejar
import re
import datetime

AUTH_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/admin/get_a_password.asp'
GET_READER_ID_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/patronr.asp'
RENEW_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/showRenew.asp?PCode={code}'
RENEW_BOOK_URL = 'http://www.library.ccnet-hk.com/central/sms/{lang}schlib/patron/saveRenew.asp'

class sms_library_api(object):
	def __init__(self):
		# create cookiejar for cookie
		self.cj = cookiejar.CookieJar()
		self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
		urllib.request.install_opener(self.opener)
		self.is_chinese = False
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
		notlocal login_appempt
		login_attempt = 0
		value = {'UserID' : id, 'Passwd' : passwd}
		data = urllib.parse.urlencode(value).encode('utf-8')
		url = self.url_formatter(AUTH_URL)
		req = urllib.request.Request(url, data)
		with urllib.request.urlopen(req) as k:
			i = k.read().decode('big5')
			login_fail = re.search(r'cschlib/admin/login.asp', i)
		if login_fail and self.login_attempt == 0:
			login_attempt+=1
			self.login()
		elif not login_fail and login_attempt == 1:
			self.is_chinese == True
			return True
		elif login_fail and login_attempt == 1:
			return False
		return True
	
	def get_reader_id(self):
		"""
		Store the reader id as self.reader_id
		"""
		url = self.url_formatter(GET_READER_ID_URL)
		with urllib.request.urlopen(url) as r:
			format_r = [i.decode('big5') for i in r]
		p = re.compile(r'\s{0,10}(\d{1,5})')
		for i in format_r:
			match = p.match(i)
			if match:
				self.reader_id = int(match.group(1))
				break
		return
	
	def get_renew(self):
		"""
		Get renew infornations
		Store in self.book, as a list
		format is [id_of_the_book, name_of_the_book, borrow_date, due_date, renewal]
		"""
		if self.is_chinese:
			url = RENEW_URL.format(lang='c', code=self.reader_id)
		else:
			url = RENEW_URL.format(lang='', code=self.reader_id)
		with urllib.request.urlopen(url) as r:
			raw = r.read().decode('big5')	
		search = re.search(r'<TR>.*</TR></TABLE><P><P>', raw)
		raw_data = search.group()
		
		value_list = [i.group(1) for i in re.finditer(r'value=(\d*)', raw_data)]
		title_list = [i.group(1) for i in re.finditer(r"<td width='45%'.*?>(.*?)</td>", raw_data)]
		renewal = [i.group(1) for i in re.finditer(R"<td width='10%'.*?>(.*?)</td>", raw_data)]
		dates = [datetime.date(int(i.group(1)), int(i.group(2)), int(i.group(3))) for i in re.finditer(r"<td width='20%'.*?>(\d{4}?)/(\d{1,2}?)/(\d{1,2}?)</td>", raw_data)]
		len_date = []
		return_date = []
		for i in range(1, len(dates)+1):
			if i%2==1:
				len_date.append(dates[i-1])
			else:
				return_date.append(dates[i-1])
		
		self.book = []
		for i in range(len(value_list)):
			book = [int(value_list[i]), title_list[i], len_date[i], return_date[i], int(renewal[i])]
			self.book.append(book)
		return

	def renew(self, book_id):
		"""
		renew book
		can only renew one book at a time
		will not reflesh data
		"""
		url = self.url_formatter(RENEW_BOOK_URL)
		value = {'PatCode' : self.reader_id, 'sel1' : book_id, 'subbut' : 'Renew'}
		data = urllib.parse.urlencode(value).encode('utf-8')
		req = urllib.request.Request(url, data)
		with urllib.request.urlopen(req) as r:
			i = r.read.decode('big5')
		return

