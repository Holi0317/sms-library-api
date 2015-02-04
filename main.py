#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sms_lib_api as o_api
import os
import datetime
import configparser

SPILT_LINE = '=============================================================='
class app(object):
	def __init__(self):
		return
	
	def main_menu(self):
		clear()
		print(SPILT_LINE)
		print(

def clear():
	os.system('cls' if os.name == 'nt' else 'clear')

def main():
	global api
	api = o_api.sms_library_api()
	return

if __name__ == '__main__':
	main()
