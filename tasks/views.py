from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.http import HttpResponse, JsonResponse
from django.db import IntegrityError
from .forms import TaskForm
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from .models import Task
from django.views import View
import json

""" Alertas de SweetAlert comprobación"""
def sweetalertMessage(icon,title,text,safe,status, redirect):
    return JsonResponse({'icon': icon,
                  'title' : title,
                  'text' : text,
                  'redirect' : redirect }, 
                  safe=safe, status=status)

""" Alertas de Bootstrap Para formularios"""
def bootstrapAlertMessage(alertType,message, safe, status):
    return JsonResponse({'alertType': alertType,
                  'message' : message }, 
                  safe=safe, status=status)

                  
# Create your views here.
""" Pagina principal de la aplicacion """
class Home(View):
    template_name = 'home.html'
    def get(self, request):
        return render(request, self.template_name)

""" Registro de un nuevo usuario """
class Signup(View):
    template_name = 'signup.html'
    form = UserCreationForm
    error = None

    #Renderiza el formulario de registro    
    def get(self, request):
        return render(request, self.template_name, {
            'form': self.form()
        })

    #Recibe los datos del formulario y crea un nuevo usuario
    def post(self, request):
        try:
            password1 = json.loads(request.body).get('password1')
            password2 = json.loads(request.body).get('password2')
            username = json.loads(request.body).get('username')

            if password1 == password2:
                user = User.objects.create_user(username=username, password=password1)
                user.save()
                login(request, user)
                return sweetalertMessage('success','Correcto','Usuario registrado correctamente',False,200,'/tasks')
            elif password1 != password2:
                return bootstrapAlertMessage('warning','La contraseña no coincide',False,400)
            elif password1 == '' or password2 == '' or username == '':
                return bootstrapAlertMessage('warning','Por favor complete todos los campos',False,400)
        except IntegrityError:
            return bootstrapAlertMessage('danger','El usuario ya existe',False,400)
        except Exception as e:
            print(e)  # Para depuración
            return bootstrapAlertMessage('danger','Ocurrió un error inesperado',False,500)
        

""" Inicio de sesion de un usuario """
class Signin(View):
    template_name = 'signin.html'
    form = AuthenticationForm
    #Renderiza el formulario de inicio de sesion
    def get(self, request):
        return render(request, self.template_name, {
            'form': self.form()
        })
    #Recibe los datos del formulario y autentica al usuario
    def post(self, request):
        user = authenticate(request, username=json.loads(request.body).get('username'), password=json.loads(request.body).get('password'))
        try:
            if user is None:
                return bootstrapAlertMessage('danger','Usuario o contraseña incorrectos',False,400) 
            else:
                login(request, user)
                return sweetalertMessage('success','Correcto','Inicio de sesión correcto',False,200,'/tasks')
        except:
            return bootstrapAlertMessage('danger','Ocurrió un error inesperado',False,500)

""" Tareas del usuario """
class TasksDashboard(LoginRequiredMixin,View):
    template_name = 'tasks/tasks.html'
    form = TaskForm
    #Renderiza las tareas del usuario
    def get(self, request):
        return render(request, self.template_name)
    
    def post(self,request):
        try:
            title = json.loads(request.body).get('title')
            description = json.loads(request.body).get('description')
            important = json.loads(request.body).get('important')
            form = self.form({'title': title, 'description': description, 'important': important})
            if form.is_valid():
                new_task = form.save(commit=False)
                new_task.user = request.user
                new_task.save()
                
                return sweetalertMessage('success','Correcto','Tarea creada correctamente',False,200,'')
            else:
                return bootstrapAlertMessage('warning','Por favor complete todos los campos',False,400)
        except:
            return bootstrapAlertMessage('danger','Ocurrió un error inesperado',False,500)

""" Se obtienen todas las tareas del usuario """
@login_required
def allTasks(request):
        if request.method == 'GET':
            try:
                tasks = Task.objects.filter(user=request.user)
                return JsonResponse(list(tasks.values()), safe=False, status=200)
            except:
                return JsonResponse({'error': 'Error al obtener las tareas'}, safe=False, status=500)

""" Se actualizan las tareas del usuario """
@login_required
def updateTask(request, task_id):
    if request.method == 'POST':
        try:
            task = Task.objects.get(pk=task_id)
            task.title = json.loads(request.body).get('title')
            task.description = json.loads(request.body).get('description')
            task.important = json.loads(request.body).get('important')
            task.save()
            return sweetalertMessage('success','Correcto','Tarea actualizada correctamente',False,200,'')
        except:
            return bootstrapAlertMessage('danger','Ocurrió un error inesperado',False,500)

@login_required
def complete_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id, user=request.user)
    if request.method == 'POST':
        try:
            if task.datecompleted is None:
                task.datecompleted = timezone.now()
                task.save()
                return sweetalertMessage('success','Correcto','Tarea completada correctamente',False,200,'')
            else:
                task.datecompleted = None
                task.save()
                return sweetalertMessage('success','Correcto','Tarea desmarcada correctamente',False,200,'')
        except:
            return JsonResponse({'error': 'Error al completar la tarea'}, safe=False, status=500)


@login_required
def delete_task(request, task_id):
    task = get_object_or_404(Task, pk=task_id, user=request.user)
    if request.method == 'POST':
        try:
            task.datecompleted = timezone.now()
            task.delete()
            return sweetalertMessage('success','Correcto','Tarea eliminada correctamente',False,200,'')
        except:
            return sweetalertMessage('danger','Error','Ocurrió un error inesperado',False,500,'')

        

@login_required
def signout(request):
    logout(request)
    return redirect("home")


def signin(request):
    if request.method == "GET":
        return render(request, 'signin.html', {
            'form': AuthenticationForm()
        })
    else:
        print(request.POST)
        user = authenticate(request, username=request.POST['username'], password=request.POST["password"])
        if user is None:
            return render(request, 'signin.html', {
                'form': AuthenticationForm(),
                'error': "Username o password is incorrect"
            })
        else:
            login(request, user)
            return redirect("tasks")


@login_required
def task_details(request, task_id):
    if request.method == 'GET':
        task = get_object_or_404(Task, pk=task_id, user=request.user)
        form = TaskForm(instance=task)
        return render(request, 'tasks/task_details.html', {
            'task': task,
        })