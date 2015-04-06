from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^account/', include('account.urls'), namespace='account'),
    url(r'^$', include('account.urls')),
)
