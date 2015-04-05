# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import oauth2client.django_orm


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='real_user',
            name='credential',
            field=oauth2client.django_orm.CredentialsField(null=True),
        ),
        migrations.AddField(
            model_name='real_user',
            name='flow',
            field=oauth2client.django_orm.FlowField(null=True),
        ),
    ]
