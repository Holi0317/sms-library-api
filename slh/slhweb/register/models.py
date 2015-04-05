from django.db import models
from django.contrib.auth.models import User
from oauth2client.django_orm import FlowField
from oauth2client.django_orm import CredentialsField


class real_user(models.Model):
    library_account = models.CharField(max_length=80)
    library_password = models.CharField(max_length=80)
    user = models.OneToOneField(User, primary_key=True)
    flow = FlowField()
    credential = CredentialsField()
