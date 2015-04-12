'Override FieldRenderer to match special case for material theme'
from bootstrap3 import renderers
from bootstrap3.utils import add_css_class
from django.forms import (
    CheckboxInput, ClearableFileInput, RadioSelect, CheckboxSelectMultiple,
    Select
)
from django.forms.extras import SelectDateWidget


class MaterialFieldRenderer(renderers.FieldRenderer):
    """
    Overrided field renderer"""

    def post_widget_render(self, html):
        if isinstance(self.widget, RadioSelect):
            html = self.list_to_class(html, 'radio')
        elif isinstance(self.widget, CheckboxSelectMultiple):
            html = self.list_to_class(html, 'checkbox')
        elif isinstance(self.widget, SelectDateWidget):
            html = self.fix_date_select_input(html)
        elif isinstance(self.widget, ClearableFileInput):
            html = self.fix_clearable_file_input(html)
        elif isinstance(self.widget, CheckboxInput):
            html = self.put_inside_label(html)
        elif isinstance(self.widget, Select):
            # use dropdown.js for dropdown menu
            html = html.replace('form-control', 'form-control select')
        return html

    def wrap_widget(self, html):
        if isinstance(self.widget, CheckboxInput):
            # Use 'togglebutton' css class for checkbox
            checkbox_class = add_css_class('togglebutton',
                                           self.get_size_class())
            html = \
                '<div class="{klass}">{content}</div>'.format(
                    klass=checkbox_class, content=html
                )
        print(html)
        return html
