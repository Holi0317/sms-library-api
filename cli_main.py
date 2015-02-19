#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

# Import required libaries
import sms_lib_api
import os
import getpass

# Import optional libaries
no_tabulate = False
try:
    from tabulate import tabulate
except ImportError:
    no_tabulate = True


class App(object):
    def __init__(self):
        self.api = sms_lib_api.sms_library_api()
        self.is_logined = False
        self.got_unreturned = False
        return

    def main_menu(self):
        clear()
        if self.is_logined:
            u = self.api.info['student_no']
        else:
            u = 'User'

        print("* * * St. Mark's School Library System * * *")
        print("Welcome, {0}".format(u))
        print("Main Menu:")
        print("[ 1 ] Login into the System")
        print("[ 2 ] Get unreturned books")
        print("[ 3 ] Renew Books")
        print("[ 0 ] Quit")
        print()
        i = rec_input(3)
        if i == '1':
            self.login()
        elif i == '2':
            self.unreturn()
        elif i == '3':
            self.renew()
        elif i == '0':
            clear()
            exit()
        else:
            print('Incorrect option')

    def login(self):
        """
        Login module
        return a bool for successful
        """
        clear()
        if self.is_logined:
            print("Logging out...")
            self.api.__init__()
            self.__init__()
        print("Logging in...")
        ac = input('Account ID: ')
        pwd = getpass.getpass()
        try:
            login_attempt = self.api.login(ac, pwd)
        except:
            print('Login Failed')
            failed = True
            return
        if login_attempt:
            self.is_logined = True
            failed = False
            print('Login Success!')
            self.api.get_reader_id()
            return True
        else:
            print('Login Failed')
            print('Incorrect user name or password')
            failed = True

        if failed:
            print('Would you like to retry? (Y/n)')
            i = rec_yes()
            if i:
                self.login()
            else:
                return False

    def unreturn(self):
        if not self.is_logined:
            print("You have not login into the system, Continuing this require a login")
            print("Would you like to login now? (Y/n)")
            if rec_yes():
                if not self.login():
                    return
            else:
                return

        print("Gathering Informations...")
        self.api.get_renew()
        self.get_unreturned = True
        if no_tabulate:
            print("* * * Tabulate is not installed. Falling to Fallback display * * *")
            print("* * * Please install Tabulate for the best experience * * * ")
            book = self.api.book
            book.insert(0, ['ID    ', 'Name             ', 'Borrow Date', 'Due Date ', 'Renewal'])
            for i in book:
                print("{0} | {1} | {2} | {3} | {4}".format(i[0], i[1], i[2], i[3], i[4]))
        else:
            print(tabulate(self.api.book, headers=['ID', 'Book Name', 'Borrow Date', 'Due Date', 'Renewal']))
        input("Press <Enter> to continue")
        return

    def renew(self):
        if not self.is_logined and not self.got_unreturned:
            print("You have not login into the system, Continuing this require a login")
            print("Would you like to login now? (Y/n)")
            if rec_yes():
                if not self.login():
                    return
                self.api.get_renew()
                self.got_unreturned = True
            else:
                return
        elif not self.got_unreturned:
            self.api.get_renew()
            self.got_unreturned = True

        if no_tabulate:
            print("* * * Tabulate is not installed. Falling to Fallback display * * *")
            print("* * * Please install Tabulate for the best experience * * * ")
            book = self.api.book
            book.insert(0, ['ID    ', 'Name             ', 'Borrow Date', 'Due Date ', 'Renewal', 'No.'])
            for c in range(len(book)):
                i = book[c]
                print("{5} | {0} | {1} | {2} | {3} | {4}".format(i[0], i[1], i[2], i[3], i[4], c))
        else:
            book = self.api.book
            for c in range(len(book)):
                i = book[c]
                i.insert(0, c+1)
            print(tabulate(book, headers=['No.', 'ID', 'Book Name', 'Borrow Date', 'Due Date', 'Renewal']))
        print("Please type the number of the book you want to renew, or 'q' for exit")
        i = rec_input(len(book))
        if i == '0':
            return
        elif i == '':
            print('incorrect option')
        if self.api.renew(book[int(i)-1][1]):
            print("Successfuly renewed!")
        else:
            print("renewal Failed!")
        print("Refleshing Data...")
        self.unreturn()
        return


def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def rec_yes(default=True):
    while True:
        i = input()
        if i == 'y' or i == 'Y' or i == 'yes':
            return True
        elif i == 'n' or i == 'N' or i == 'no':
            return False
        elif i == '':
            return default
        else:
            print('invaild option')


def rec_input(max):
    while True:
        raw = input('>>>')
        if raw == 'q' or raw == 'Q':
            return '0'
        elif raw.isdigit() and int(raw) <= max:
            return raw
        elif raw.isdigit():
            print('Number is out of boundary')
        else:
            print("Incorrect option")


def main():
    app = App()
    while True:
        app.main_menu()

if __name__ == '__main__':
    main()
