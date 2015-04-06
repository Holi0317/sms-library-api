# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import oauth2client.django_orm


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='student',
            fields=[
                ('library_account', models.CharField(max_length=80)),
                ('library_password', models.CharField(max_length=80)),
                ('credential', oauth2client.django_orm.CredentialsField(null=True)),
                ('id', models.CharField(max_length=50, serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=80)),
                ('user', models.OneToOneField(null=True, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
