from django import forms
from .models import Task


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ['title', 'description', 'important']
        widgets : {
            'title' : forms.TextInput(attrs={'class':'form-control', 
                    'placeholder':'Titulo de la tarea', 
                    'autofocus':True,
                    'label':'Titulo'}),
            'description' : forms.Textarea(attrs={'class':'form-control',
                            'placeholder':'Descripcion de la tarea',
                            'label':'Descripcion'}),
            'important':forms.CheckboxInput(attrs={'class':'form-check-input m-auto',
                            'label':'Importante'})
        }