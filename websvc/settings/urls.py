from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect


urlpatterns = [
    # TODO: following needs a way to run both in dev and prod mode, that is with/without the simba/ prefix
    path('simba/api/', include('endpoints.urls')),  # apis
    path('admin/', admin.site.urls),  # for admin interface 
    path('simba/admin/', lambda request: redirect('/admin', permanent=True)),  # old admin URL
    path('', include('pagebox.urls')),  # default goes to the user facing pagebox
]
