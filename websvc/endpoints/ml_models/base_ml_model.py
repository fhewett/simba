from time import time
#from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from ..models import APIRequestLog


class BaseMLModel(APIView):
    """Base class for all our ML models.  you need to override the process() method
    The class inherits from Django views so it is directly callable as a view (e.g. in urls.py)
    It also handles database logging including exception handling"""

    def __init__(self):
        # self.name = "basemodel-to-be-overridden"
        super().__init__()

    def process(self, input_text):
        raise NotImplementedError

    def __call__(self, request, *args, **kwargs):
        return self.dispatch(request, *args, **kwargs)

    # error 405: GET not supported
    #def get(self, request, *args, **kwargs):
    #    return Response("GET not supported")

    @csrf_exempt
    @parser_classes([JSONParser])  # only JSON
    def post(self, request, *args, **kwargs):
        # Handle the POST request here
        st = time()
        input_text = request.data
        print(request)
        #meta = # TODO: extract sanitized URL (nothing after ?) from request
        try:
            output = self.process(input_text)
        except Exception as e:
            output = "EXCEPTION: " + str(e)
            pass
        self.log_to_database(input_text, output)
        # TODO: also return the log ID (for feedback)
        return Response(output)

    def log_to_database(self, input, output):
         # TODO: Database logging logic
         pass
