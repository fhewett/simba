from django.urls import path
from .ml_models import *
from .views import *

urlpatterns = [
    path('sum-extract', SummaryLexRank.as_view()),
    path('sum-abstract', SummaryMT5TSys.as_view()),
    #path('sum-openai', SummaryOpenAI.as_view()),
    path('sum-dummy', SummaryDummy.as_view()),
    path('feedback', Feedback.as_view()),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')) -- possibly needed re auth
]