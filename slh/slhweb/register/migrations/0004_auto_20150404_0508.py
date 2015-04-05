# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0003_auto_20150404_0443'),
    ]

    operations = [
        migrations.RenameField(
            model_name='real_user',
            old_name='id',
            new_name='user',
        ),
    ]
