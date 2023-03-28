from django.urls import path
from .ml_models import *

urlpatterns = [
    path('sum-lexrank', SummaryLexRank.as_view()),
    path('sum-mt5tsys', SummaryMT5TSys.as_view()),
    path('sum-openai', SummaryOpenAI.as_view()),
    path('sum-dum', SummaryDummy.as_view()),
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')) -- possibly needed re auth
]