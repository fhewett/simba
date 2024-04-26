from django.urls import path
from .views import *

urlpatterns = [
    path('sum-abstract', RestSimplifyApi.as_view()),
    path('feedback', RestFeedbackApi.as_view()),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')) -- possibly needed re auth
]