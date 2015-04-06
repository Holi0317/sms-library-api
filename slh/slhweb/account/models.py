from django.db import models
from django.contrib.auth.models import User
from oauth2client.django_orm import CredentialsField


# TODO rename this to UserProfile
class student(models.Model):
    user = models.OneToOneField(User, null=True)
    library_account = models.CharField(max_length=80)
    library_password = models.CharField(max_length=80)
    credential = CredentialsField()
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=80)
    lang = models.CharField(max_length=20, default='en-us')
