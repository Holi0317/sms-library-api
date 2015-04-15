"""
WSGI config for slhweb project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/howto/deployment/wsgi/
"""

import os
import sys
os.environ['DJANGO_SETTINGS_MODULE'] = 'slhweb.settings'
root_path = os.path.abspath(os.path.split(__file__)[0])
sys.path.insert(0, os.path.join(root_path, '..'))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
