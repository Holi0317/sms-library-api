from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from oauth2client.django_orm import CredentialsField


class UserProfile(models.Model):
    user = models.OneToOneField(User, unique=True)
    library_account = models.CharField(max_length=80)
    library_password = models.CharField(max_length=80)
    credential = CredentialsField()
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=80)
    lang = models.CharField(max_length=20, default='en',
                            choices=settings.LANGUAGES)

    def __str__(self):
        return str(self.user)
