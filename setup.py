#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# License: MIT License

from ez_setup import use_setuptools
use_setuptools()
from setuptools import setup, find_packages

setup(
    name='sms-lib-helper',
    version='1.0',
    pacakages=find_packages(),
    install_requires=[
        'click',
        'beautifulsoup4',
        'flask',
        'google-api-python-client',
    ],
    entry_points={
        'console_scripts': [
            'slh-server = slh.backend:cli',
            'slh-cli = slh.cli_main:cli',
        ]
    }
)
