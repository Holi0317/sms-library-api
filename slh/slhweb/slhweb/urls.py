from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import TemplateView
from django.core.urlresolvers import reverse

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', TemplateView.as_view(template_name='index.html')),
    url(r'^account/', include('account.urls', namespace='account', app_name='account')),
    # url(r'^accounts/login', reverse('account:auth_login')),
)
