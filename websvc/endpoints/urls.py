from django.urls import path
from .ml_models import *
from .views import *

urlpatterns = [
    path('sum-abstract', SummaryViaVLLM.as_view()),
    path('feedback', Feedback.as_view()),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')) -- possibly needed re auth
]