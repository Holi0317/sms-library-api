# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import oauth2client.django_orm


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0004_auto_20150404_0508'),
    ]

    operations = [
        migrations.CreateModel(
            name='student',
            fields=[
                ('id', models.AutoField(auto_created=True, verbose_name='ID', primary_key=True, serialize=False)),
                ('library_account', models.CharField(max_length=80)),
                ('library_password', models.CharField(max_length=80)),
                ('credential', oauth2client.django_orm.CredentialsField(null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='real_user',
            name='user',
        ),
        migrations.DeleteModel(
            name='real_user',
        ),
    ]
