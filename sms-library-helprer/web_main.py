#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

import lib_api
import json
import click
import datetime
import os
import sys.platform


class App(object):
    def __init__(self):
        self.api = lib_api.library_api()
        return

    def login(self, id, passwd):
        self.id = id
        try:
            attempt = self.api.login(id, passwd)
        except:
            self.failed = True
        if attempt:
            self.failed = False
        else:
            self.failed = True


@click.group()
def cli():
    pass


@cli.command()
def main():
    click.echo('Initializing...')
    path = os.path.join('data', 'web_data')
    if not os.path.isfile(path):
        click.echo('web_data file not found')
        click.echo('Please create it with add_user')
        exit(1)
    with open(path, 'r') as f:
        raw = f.read()
    login_data = json.loads(raw)
    object_list = [App() for i in range(len(login_data))]
    remove_list = []

    click.echo('Logging in...')
    for i in range(len(login_data)):
        current_object = object_list[i]
        current_id = login_data[i][0]
        current_pwd = login_data[i][1]
        current_object.login(current_id, current_pwd)
        if current_object.failed:
            click.echo('{0} failed to login.'.format(current_id))
            remove_list.append(current_object)

    # remove failed object
    for i in remove_list:
        object_list.remove(i)

    # Get unreturned list
    remove_list = []
    for current_object in object_list:
        current_object.api.get_reader_id()
        current_object.api.get_renew()
        if current_object.api.book == []:
            click.echo('{0} has no borrowed book'.format(current_object.id))
            remove_list.append(current_object)

    # remove failed objects
    for i in remove_list:
        object_list.remove(i)

    # Renew book
    today = datetime.date.today()
    for current_object in object_list:
        for current_book in object_list.api.book:
            diff = current_book[3] - today
            if diff.days <= 2:
                click.echo('Renew {0} for {1}'.format(current_book[1],
                                                      current_object.id))
                current_object.renew(current_book[0])


@cli.command()
@click.option('--id', '-i', help='Account of user', prompt='ID')
@click.option('--pwd', '-p', help='password of user', prompt='Password',
              hide_input=True)
def add(id, passwd):
    path = os.path.join('data', 'web_data')
    if not os.path.exists('data'):
        os.makedirs('data')
    if os.path.isfile(path):
        with open(path, 'r') as f:
            raw = f.read()
        data = json.loads(raw)
    else:
        data = []
    data.append(id, passwd)
    value = json.dumps(data)
    with open(path, 'w') as f:
        f.write(value)
    if sys.platform.startswith('linux'):
        os.chmod(path, 0o400)
