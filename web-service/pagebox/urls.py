from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('submit-feedback/', views.submit_feedback, name='feedback'),
    # perhaps necessary to map this /favicon.ico to /static/pagebox/favicon.svg?
]