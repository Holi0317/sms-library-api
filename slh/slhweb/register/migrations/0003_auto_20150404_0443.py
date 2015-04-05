# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0002_auto_20150404_0404'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='real_user',
            name='parent_user',
        ),
        migrations.AlterField(
            model_name='real_user',
            name='id',
            field=models.OneToOneField(primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL),
        ),
    ]
