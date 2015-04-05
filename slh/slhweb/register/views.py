from django.shortcuts import render, redirect
from oauth2client.client import OAuth2WebServerFlow
from . import models


FLOW = OAuth2WebServerFlow(client_id='58454653320-s5731fctebqgtmingtfcn4amdlhhskpd.apps.googleusercontent.com',
                           client_secret='HFgYs5OFs_yUtb2nZ7z77SMi',
                           scope='https://www.googleapis.com/auth/calendar',
                           redirect_uri='http://localhost:8000/register/oauth2callback')
def index(request):
    return render(request, 'index.html')


def login(request):
    auth_uri = FLOW.step1_get_authorize_url()
    return redirect(auth_uri)


def oauth2callback(request):
    # ru = models.real_user()
    # ru.credential = FLOW.step2_exchange(request.GET)
    # ru.save()
    return redirect('/')
