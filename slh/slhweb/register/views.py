from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from oauth2client.client import OAuth2WebServerFlow
from apiclient.discovery import build
from .models import student
import httplib2


FLOW = OAuth2WebServerFlow(client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                           client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                           scope=('https://www.googleapis.com/auth/calendar',
                                  'https://www.googleapis.com/auth/plus.me'),
                           redirect_uri='http://localhost:8000/register/oauth2callback')


def index(request):
    return render(request, 'index.html')


def auth_login(request):
    auth_uri = FLOW.step1_get_authorize_url()
    return redirect(auth_uri)


def oauth2callback(request):
    credential = FLOW.step2_exchange(request.GET)
    http = credential.authorize(httplib2.Http())
    plus = build('plus', 'v1', http)
    try:
        req = plus.people().get(userId='me').execute()
    except AccessTokenRefreshError:
        credential.refresh()
        http = credential.authorize(httplib2.Http())
        plus = build('plus', 'v1', http)
        req = plus.people().get(userId='me').execute()
    name = req['displayName']
    id = req['id']
    try:
        # User have registered
        ss = student.objects.get(id=id)
        user = ss.user
        user.username = name
        user.save()
    except student.DoesNotExist:
        # Create new user
        ss = student()
        user = User.objects.create_user(name, password=settings.COMMON_PASSWORD)
        user.save()
        ss.user = user
        ss.id = id
        ss.credential = credential
        ss.save()

    user = authenticate(username=name, password=settings.COMMON_PASSWORD)
    login(request, user)
    return redirect('/')


def change_settings(request):
    pass


def auth_logout(request):
    logout(request)
    return redirect('/')
