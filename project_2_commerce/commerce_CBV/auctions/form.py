from django.forms import ModelForm

from .models import Listing


class ListingForm(ModelForm):
    class Meta:
        model = Listing
        exclude = ["owner", "is_active", "winner", "interested_by"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({"placeholder": f"{field_name.capitalize()}"})

        self.fields["category"].empty_label = "Select a category"
