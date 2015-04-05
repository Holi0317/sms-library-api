from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^login$', views.auth_login, name='auth_login'),
    url(r'^oauth2callback$', views.oauth2callback, name='oauth2callback'),
    url(r'^settings$', views.change_settings, name='change_settings'),
    url(r'^logout$', views.auth_logout, name='auth_logout'),
]
