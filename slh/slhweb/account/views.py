from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.core.urlresolvers import reverse, reverse_lazy
from django.utils import translation
from oauth2client.client import OAuth2WebServerFlow, AccessTokenRefreshError
from apiclient.discovery import build
from .models import UserProfile
import httplib2


FLOW = OAuth2WebServerFlow(client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                           client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                           scope=('https://www.googleapis.com/auth/calendar',
                                  'https://www.googleapis.com/auth/plus.me'),
                           redirect_uri=settings.GOOGLE_REDIRECT_URI,
                           access_type='offline')


def index(request):
    return render(request, 'account/index.html')


def auth_login(request):
    auth_uri = FLOW.step1_get_authorize_url()
    try:
        request.session['next'] = request.GET['next']
    except KeyError:
        request.session['next'] = None
    return redirect(auth_uri)


def oauth2callback(request):
    credential = FLOW.step2_exchange(request.GET)
    http = credential.authorize(httplib2.Http())
    plus = build('plus', 'v1')
    try:
        req = plus.people().get(userId='me').execute(http=http)
    except AccessTokenRefreshError:
        # Force refresh credential
        credential.refresh()
        http = credential.authorize(httplib2.Http())
        plus = build('plus', 'v1')
        req = plus.people().get(userId='me').execute(http=http)
    name = req['displayName']
    id = req['id']
    try:
        # Check if user have registered
        ext_user = UserProfile.objects.get(id=id)
        # Get user object, update name
        user = ext_user.user
        user.username = name
        user.save()
    except UserProfile.DoesNotExist:
        # Create new user
        user = User.objects.create_user(name,
                                        password=settings.COMMON_PASSWORD)
        ext_user = UserProfile(user=user, id=id, name=name,
                               credential=credential)
        ext_user.save()
        user.save()

    user = authenticate(username=name, password=settings.COMMON_PASSWORD)
    login(request, user)

    translation.activate(ext_user.lang)
    request.session[translation.LANGUAGE_SESSION_KEY] = ext_user.lang
    request.session['django_language'] = ext_user.lang
    request.session.modified = True

    if request.session['next'] is None:
        del request.session['next']
        return redirect(reverse('account:index'))
    else:
        target = request.session['next']
        del request.session['next']
        return redirect(target)


@csrf_protect
@login_required(login_url=reverse_lazy('account:auth_login'))
def change_settings(request):
    if request.method == 'GET':
        return render(request, 'account/settings.html')
    elif request.method == 'POST':
        data = request.POST
        ext_user = request.user.userprofile
        ext_user.library_account = data['lib-username']
        ext_user.library_password = data['lib-pwd']
        ext_user.name = data['username']
        ext_user.lang = data['lang']
        ext_user.save()

        translation.activate(data['lang'])
        request.session[translation.LANGUAGE_SESSION_KEY] = data['lang']
        request.session['django_language'] = data['lang']
        request.session.modified = True
        return redirect(reverse('account:index'))


def auth_logout(request):
    logout(request)
    return redirect(reverse('account:index'))
