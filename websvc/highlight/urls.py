from django.urls import path, include
# from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes


@csrf_exempt
@api_view(['POST'])  # only POST; note REST security must allow
@parser_classes([JSONParser])    # only JSON
def test_nlines(request):
    resp = len(request.data.splitlines())  # num of lines
    return Response({'received data': resp})


urlpatterns = [
    path('test1', test_nlines),
    #path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]