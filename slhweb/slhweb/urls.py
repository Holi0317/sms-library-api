from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name='index.html'), name='root'),
    url(r'^account/', include('account.urls', namespace='account', app_name='account')),
)
