from django import forms
from django.utils.translation import ugettext as _
from django.utils import translation
from django.conf import settings
from django.contrib.auth import logout
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, Submit, Reset, HTML, Field,\
    Div, Button
from crispy_forms.bootstrap import FormActions
from oauth2client.client import OAuth2Credentials

import httplib2


class SettingForm(forms.Form):
    name = forms.CharField(max_length=80, label=_('Username'))
    lang = forms.ChoiceField(choices=settings.LANGUAGES, label=_('Language'))
    action = forms.CharField(max_length=20, widget=forms.HiddenInput(),
                             initial='update')

    # library module
    library_module_enabled = forms.BooleanField(required=False,
                                                label=_('Enable'))
    library_account = forms.CharField(max_length=80, required=False,
                                      label=_('Library account'))
    library_password = forms.CharField(widget=forms.PasswordInput,
                                       max_length=80, required=False,
                                       label=_('Library password'))

    def __init__(self, *args, **kwargs):
        'override this for saving request object and bind data'
        self.request = kwargs.pop('request', None)
        profile = self.request.user.userprofile
        data = {'name': profile.name,
                'lang': profile.lang,
                'library_module_enabled': profile.library_module_enabled,
                'library_account': profile.library_account,
                'library_password': profile.library_password}
        kwargs['initial'] = data
        super(SettingForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'setting-form'
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'col-lg-2'
        self.helper.field_class = 'col-lg-10'
        self.helper.layout = Layout(
            Fieldset('Basic informations',
                     'name',
                     'lang',
                     'action',
                     css_id='information'),
            HTML("<h2>{0}</h2>".format(_('Modules'))),
            Fieldset('Library Module',
                     Field('library_module_enabled',
                           template='togglebutton.html'),
                     Div('library_account',
                         'library_password',
                         css_class='module-toggle'),
                     css_id='library'),
            FormActions(Submit('submit', 'Submit'),
                        Reset('reset', 'Reset'),
                        Button('fake-delete', 'Delete Account',
                               css_class='btn-danger',
                               data_toggle='modal',
                               data_target='#delete-warn'),
                        css_class='trans')
        )

    def save(self):
        profile = self.request.user.userprofile

        if self.cleaned_data['action'] == 'delete':
            self._remove()
            return 'delete'

        profile.name = self.cleaned_data['name']
        profile.lang = self.cleaned_data['lang']

        profile.library_module_enabled = \
            self.cleaned_data['library_module_enabled']
        profile.library_account = self.cleaned_data['library_account']
        profile.library_password = self.cleaned_data['library_password']

        profile.save()

        # Update language
        translation.activate(profile.lang)
        self.request.session[translation.LANGUAGE_SESSION_KEY] = profile.lang
        self.request.session['django_language'] = profile.lang
        self.request.session.modified = True

        return 'update'

    def _remove(self):
        profile = self.request.user.userprofile
        user = self.request.user

        # Void google oauth2 permission
        credential = OAuth2Credentials.from_json(profile.credential)
        http = credential.authorize(httplib2.Http())
        credential.revoke(http=http)

        # Remove profile from database
        user.delete()
        profile.delete()

        # Logout
        logout(self.request)

    def clean(self):
        cleaned_data = super(SettingForm, self).clean()
        library_module_enabled = cleaned_data.get('library_module_enabled')
        library_account = cleaned_data.get('library_account')
        library_password = cleaned_data.get('library_password')
        if not library_module_enabled:
            pass
        elif library_module_enabled and library_account and library_password:
            pass
        else:
            raise forms.ValidationError(
                _('%(field1)s and %(field2)s is required'),
                code='required',
                params={'field1': _('Library account'),
                        'field2': _('Library password')})
