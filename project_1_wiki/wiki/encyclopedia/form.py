from django import forms


class PageForm(forms.Form):
    title = forms.CharField(label="Title", 
                            max_length=200, 
                            widget=forms.TextInput(attrs={
                                "class": "form-control",
                                "autofocus": "autofocus"
                            }))

    content = forms.CharField(label="Content", 
                              widget=forms.Textarea(attrs={
                                  "class": "form-control"
                              }))
