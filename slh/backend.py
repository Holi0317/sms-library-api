#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License
'execute khh for tones of users at once'

import slh.slhapi
import json
import click
import datetime
import os
import sys
import logging
import logging.config
import sqlite3


def create_log_config():
    'Create default logging.conf if not found'
    import configparser
    log_path = PATHS['log_path']
    config = configparser.ConfigParser()

    screen_format = r'[%(name)s] [%(levelname)s] %(message)s'
    file_format = r'%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    config['loggers'] = {'keys': 'root'}
    config['handlers'] = {'keys': 'screen,file'}
    config['formatters'] = {'keys': 'screen,file'}
    config['logger_root'] = {'level': 'NOTSET',
                             'handlers': 'screen,file'}
    config['handler_screen'] = {'class': 'StreamHandler',
                                'level': 'ERROR',
                                'formatter': 'screen',
                                'args': '(sys.stdout,)'}
    config['handler_file'] = {'class': 'FileHandler',
                              'level': 'DEBUG',
                              'formatter': 'file',
                              'args': (log_path, 'a')}
    config['formatter_screen'] = {'format': screen_format,
                                  'class': 'logging.Formatter'}
    config['formatter_file'] = {'format': file_format,
                                'class': 'logging.Formatter'}

    if not os.path.exists(PATHS['log_config']):
        os.makedirs(BASE_DIR)
    with open(PATHS['log_config'], 'w') as config_file:
        config.write(config_file)


BASE_DIR = os.path.join(os.path.expanduser('~'), '.slh')
LOG_CONFIG_DIR = os.path.join(BASE_DIR, 'logging.conf')
PATHS = {'sql': os.path.join(BASE_DIR, 'web_data.sqlite3'),
         'json': os.path.join(BASE_DIR, 'web_data.json'),
         'log_config': os.path.join(BASE_DIR, 'logging.conf'),
         'log_path': os.path.join(BASE_DIR, 'log', 'web.log')}
if not os.path.exists(LOG_CONFIG_DIR):
    create_log_config()
logging.config.fileConfig(LOG_CONFIG_DIR, disable_existing_loggers=False)


@click.group()
def cli():
    'click group handler'
    pass


@cli.command()
def main():
    'Main function of the whole server'
    # Initialize
    logger = logging.getLogger()
    logger.info('=================Running main()=====================')
    logging.debug('Base dir: %s', BASE_DIR)
    api = slh.slhapi.library_api()
    failed = 0
    today = datetime.date.today()
    target_date = 3

    # Read database
    if not os.path.isfile(PATHS['sql']):
        logger.error('database not found')
        logger.error('Please create it with add')
        logger.error('Please use merge if you have json database')
        exit(1)
    conn = sqlite3.connect(PATHS['sql'])
    cur = conn.cursor()
    fetch = cur.execute('SELECT * FROM users')
    login_data = fetch.fetchall()
    logger.info('Length of login data: %s', len(login_data))

    # Main Loop
    for i in range(len(login_data)):
        api.__init__()
        current_id = login_data[i][0]
        current_pwd = login_data[i][1]
        logger.debug('Current ID: %s', current_id)
        attempt = api.login(current_id, current_pwd)
        if not attempt:
            logger.warn('%s Failed to login', current_id)
            failed += 1
            continue

        # Get unreturned list
        api.get_reader_id()
        if not api.get_renew():
            logger.info('No borrowed book for %s', current_id)
            continue

        # Renew book
        for current_book in api.book:
            diff = current_book[3] - today
            logger.debug('Diff: %s', diff.days)
            if diff.days <= target_date:
                logger.info('Renew %s, User: %s', current_book[1], current_id)
                if api.renew(current_book[0]):
                    logger.info('Renew succeed')
                else:
                    logger.info('Renew time exceed 5 times')
            else:
                logger.info('This book does not need to be renewed')

    if failed != 0:
        logger.info('Failed: %s', failed)


@cli.command()
@click.option('--loginid', '-i', help='Account of user', prompt='ID')
@click.option('--passwd', '-p', help='password of user', prompt='Password',
              hide_input=True)
def add(loginid, passwd):
    'Add user to the database'
    logger = logging.getLogger()
    logger.info('========Adding user==============')
    if not os.path.exists(BASE_DIR):
        logger.info('BASE does not exist. creating')
        os.makedirs(BASE_DIR)
    if os.path.isfile(PATHS['sql']) and sys.platform.startswith('linux'):
        logger.debug('Platform is linux')
        os.chmod(PATHS['sql'], 0o600)
        was_exist = True
    elif os.path.isfile(PATHS['sql']):
        was_exist = True
    else:
        was_exist = False

    conn = sqlite3.connect(PATHS['sql'])
    cur = conn.cursor()
    if not was_exist:
        cur.execute('CREATE TABLE users (id, passwd)')
    cur.execute('INSERT INTO users VALUES (?, ?)', (loginid, passwd))
    conn.commit()
    conn.close()

    if sys.platform.startswith('linux'):
        os.chmod(PATHS['sql'], 0o400)


@cli.command()
def migrate():
    'Migrate .json file to sqlte database'
    logger = logging.getLogger()
    logger.info('===========migrating json to sqlite===============')
    if not os.path.exists(PATHS['json']):
        logger.error('json file not found. exiting...')
        exit(1)
    with open(PATHS['json'], 'r') as file:
        raw = file.read()
    data = json.loads(raw)

    if sys.platform.startswith('linux') and os.path.exists(PATHS['sql']):
        logger.debug('Platform is linux')
        os.chmod(PATHS['sql'], 0o600)
    conn = sqlite3.connect(PATHS['sql'])
    cur = conn.cursor()
    cur.execute('CREATE TABLE users (id, passwd)')
    cur.executemany('INSERT INTO users VALUES(?, ?)', data)
    conn.commit()
    conn.close()
    if sys.platform.startswith('linux'):
        os.chmod(PATHS['sql'], 0o400)
