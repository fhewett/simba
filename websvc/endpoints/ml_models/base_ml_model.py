from time import time
import uuid
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from ..db_models import APIRequestLog


@parser_classes([JSONParser, FormParser])
class BaseMLModel(APIView):
    """Base class for all our ML models.  you need to override the process() method
    The class inherits from Django views so it is directly callable as a view (e.g. in urls.py)
    It also handles database logging including exception handling"""

    def __init__(self):
        super().__init__()

    def process(self, input_text):
        raise NotImplementedError

    def __call__(self, request, *args, **kwargs):
        return self.dispatch(request, *args, **kwargs)

    # error 405: GET not supported
    #def get(self, request, *args, **kwargs):
    #    return Response("GET not supported")

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        # Handle the POST request here
        st = time()
        input_text = request.data.get("text", "") if type(request.data) is dict else str(request.data)
        input_text = input_text[:2000]   # hack for now to limit size of input re speed/timeout
        meta_url = request.data.get("url", "") if type(request.data) is dict else ""
        if "?" in meta_url:
            meta_url = meta_url.split("?")[0]  # cutoff very personal part of URL
        error = ""
        try:
            output = self.process(input_text)
        except Exception as e:
            # TODO: this should probably be not 200 -- and return an error in the output
            error = str(e)
            output = "ERROR: " + error
        duration = time() - st

        # log to database model APIRequestLog
        logobj = APIRequestLog.objects.create(
            id = uuid.uuid4().hex,
            model=self.name,
            input=input_text,
            meta_url=meta_url,
            output=output,
            duration=duration,
            error=error
        )
        return Response({"output": output, "uuid": logobj.id})
