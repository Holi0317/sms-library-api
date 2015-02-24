#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

from setuptools import setup, find_packages

setup(
    name='sms-lib-helper',
    version='0.1',
    pacakages=find_packages(),
    install_requires=[
        'click',
        'tabulate',
    ],
    entry_points={
        'console_scripts': [
            'lib-helper-server = sms-lib-helper.web_main:cli'
            'lib-helper-cli = sms-lib-helper.cli_main:cli'
        ]
    }
)
