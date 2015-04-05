# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='real_user',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('library_account', models.CharField(max_length=80)),
                ('library_password', models.CharField(max_length=80)),
                ('parent_user', models.OneToOneField(to=settings.AUTH_USER_MODEL, related_name='parent')),
            ],
        ),
    ]
