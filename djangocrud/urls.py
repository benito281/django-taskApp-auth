"""
URL configuration for djangocrud project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from tasks import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.Home.as_view(), name="home"),
    path('signup/', views.Signup.as_view(), name="signup"),
    path('tasks/', views.TasksDashboard.as_view(), name="tasks"),
    path('api/tasks/', views.allTasks, name="all_tasks"),
    path('logout/', views.signout, name="logout"),
    path('signin/', views.Signin.as_view(), name="signin"),
    path("tasks/<int:task_id>", views.task_details ,name="details"),
    path("tasks/<int:task_id>/update", views.updateTask ,name="update"),
    path("tasks/<int:task_id>/complete", views.complete_task ,name="complete"),
    path("tasks/<int:task_id>/delete", views.delete_task ,name="delete"),

]
