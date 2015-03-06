#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

import slh.slhapi
import json
import click
import datetime
import os
import sys
import logging


home_dir = os.path.expanduser('~')
base = os.path.join(home_dir, '.slh')

# Initialize logging
path = os.path.join(base, 'log')
if not os.path.exists(path):
    os.makedirs(path)
path = os.path.join(path, 'web.log')

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler(path)
file_handler.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.ERROR)
# create and install formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)
# add handler to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)


@click.group()
def cli():
    pass


@cli.command()
def main():
    # Initialize
    logger.info('=================Running main()=====================')
    logging.debug('Base dir: {0}'.format(base))
    api = slh.slhapi.library_api()
    failed = 0
    today = datetime.date.today()

    # Read JSON file
    path = os.path.join(base, 'web_data.json')
    if not os.path.isfile(path):
        logger.error('web_data file not found')
        logger.error('Please create it with add')
        exit(1)
    with open(path, 'r') as f:
        raw = f.read()
    login_data = json.loads(raw)
    logger.debug('Login Data: {0}'.format(login_data))
    logger.info('Length of login data: {0}'.format(len(login_data)))

    # Main Loop
    for i in range(len(login_data)):
        api.__init__()
        current_id = login_data[i][0]
        current_pwd = login_data[i][1]
        logger.debug('Current ID: {0}'.format(current_id))
        attempt = api.login(current_id, current_pwd)
        if not attempt:
            logger.warn('{0} Failed to login'.format(current_id))
            failed += 1
            continue

        # Get unreturned list
        api.get_reader_id()
        if not api.get_renew():
            logger.info('No borrowed book for {0}'.format(current_id))
            continue

        # Renew book
        for current_book in api.book:
            diff = current_book[3] - today
            if diff.days <= 2:
                logger.info('Renew {0}, User: {1}'.format(current_book[1],
                                                          current_id))
                if api.renew(current_book[0]):
                    logger.info('Renew succeed')
                else:
                    logger.info('Renew time exceed 5 times')
            else:
                logger.info('No book need to be renewed.')

    if failed != 0:
        logger.info('Failed: {0}'.format(failed))


@cli.command()
@click.option('--id', '-i', help='Account of user', prompt='ID')
@click.option('--passwd', '-p', help='password of user', prompt='Password',
              hide_input=True)
def add(id, passwd):
    path = os.path.join(base, 'web_data.json')
    if not os.path.exists(base):
        os.makedirs(base)
    if os.path.isfile(path):
        with open(path, 'r') as f:
            raw = f.read()
        data = json.loads(raw)
    else:
        data = []
    data.append([id, passwd])
    value = json.dumps(data, indent=4, sort_keys=True)
    if os.path.isfile(path) and sys.platform.startswith('linux'):
        os.chmod(path, 0o600)
    with open(path, 'w') as f:
        f.write(value)
    if sys.platform.startswith('linux'):
        os.chmod(path, 0o400)
