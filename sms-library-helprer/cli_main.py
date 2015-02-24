#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

import lib_api
import os
import click
from tabulate import tabulate
import json
import sys.platform


@click.group()
def cli():
    pass


@cli.command()
def main():
    api = lib_api.library_api()
    login(api)
    api.get_reader_id()
    api.get_renew()

    book = api.book
    for count in range(len(book)):
        i = book[count]
        i.insert(0, count+1)
    click.echo(tabulate(book, headers=['No.', 'ID', 'Book Name', 'Borrow Date',
                                       'Due Date', 'Renewal']))
    click.echo("Please type the number of the book you want to renew")
    click.echo('Or press <Enter> to exit')

    input = click.prompt('No. ', default=-1, show_default=False, type=int)
    if input == -1:
        exit(0)
    else:
        attempt = api.renew(book[input-1][1])
    if attempt:
        click.echo("Successfuly renewed!")
    else:
        click.echo("Renewal Failed!")

    click.echo("Refleshing Data...")
    api.get_renew()
    click.echo(tabulate(api.book, headers=['ID', 'Book Name', 'Borrow Date',
                                           'Due Date', 'Renewal']))
    exit(0)


@cli.command()
@click.option('--ac', '-a', help='Account of the user', prompt='Account')
@click.option('--passwd', '-p', help='Password of the user', prompt='Password',
              hide_input=True)
def add(ac, passwd):
    click.echo('Adding user...')
    path = os.path.join('data', 'account')
    if not os.path.exists('data'):
        os.makedirs('data')
    value = [ac, passwd]
    data = json.dumps(value, sort_keys=True, indent=4)
    with open(path, 'w') as f:
        f.write(data)
    click.echo('Done!')

    if sys.platform.startswith('linux'):
        click.echo('Changing permission to 400...')
        os.chmod(path, 0o400)


def login(api):
    click.echo('Logging in...')
    path = os.path.join('data', 'account')
    if os.path.isfile(path):
        click.echo('Account file found. Using it to login...')
        with open(path, 'r') as f:
            raw = f.read()
        json_data = json.loads(raw)
        ac = json_data[0]
        pwd = json_data[1]
    else:
        ac = click.prompt('Account ID: ')
        pwd = click.prompt('Password: ', hide_input=True)

    # Login
    try:
        attempt = api.login(ac, pwd)
    except:
        click.echo('Login Failed')
        exit(1)

    if attempt:
        click.echo('Login Success!')
        return
    else:
        click.echo('Login Failed')
        click.echo('Incorrect user name or password')
        exit(1)

if __name__ == '__main__':
    cli()
