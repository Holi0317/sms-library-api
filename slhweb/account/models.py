from django.db import models
from django.contrib.auth.models import User
from django.conf import settings


class UserProfile(models.Model):
    user = models.OneToOneField(User, unique=True, null=True)
    library_account = models.CharField(max_length=80)
    library_password = models.CharField(max_length=80)
    credential = models.CharField(max_length=500, null=True)
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=80)
    lang = models.CharField(max_length=20, default='en',
                            choices=settings.LANGUAGES)
    library_module_enabled = models.BooleanField(default=False)

    def __str__(self):
        return str(self.user)
