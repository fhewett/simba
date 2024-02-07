"""settings URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
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
from django.urls import path, include

urlpatterns = [
    # TODO: following needs a way to run both in dev and prod mode, that is with/without the simba/ prefix
    path('simba/api/', include('endpoints.urls')),  # apis
    path('simba/admin/', admin.site.urls),  # for admin interface
    # path('api-auth/', include('rest_framework.urls'))  # TODO: if one wishes to have write access with REST framework?
]
