from time import time
import uuid
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
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
        st = time()
        # Parse the POST data
        input_text = request.data.get("text", "") if type(request.data) is dict else str(request.data)
        input_text = input_text.replace('\u00A0', ' ')   # fix nbsp in frontend (truncation moved into the mlmodels)
        meta_url = request.data.get("url", "") if type(request.data) is dict else ""
        browser_id = request.data.get("bid", "") if type(request.data) is dict else ""
        if "?" in meta_url:
            meta_url = meta_url.split("?")[0]  # cutoff very private part of URL
        # Create DB log entry
        logobj = APIRequestLog.objects.create(
            id=uuid.uuid4().hex,
            model=self.name,
            browser_id=browser_id,
            meta_url=meta_url,
            input=input_text,
        )
        # Use cache to only run the ML models if they haven't been run for this user/url before
        error = ""
        from_cache = True
        output = cache.get(f"smb:{self.name}:{browser_id}:{meta_url}") if meta_url != "" and browser_id != "" else None
        if output is None:
            from_cache = False
            try:
                output = self.process(input_text)
                cache.set(f"smb:{self.name}:{browser_id}:{meta_url}", output, 86400)  # Cache the result for 24 hours
            except Exception as e:
                # TODO: this should probably be not 200 -- but that requires coord with plugin
                error = str(e)
                output = "ERROR: " + error
        duration = int((time() - st) * 1000)  # response time in ms
        # update database log
        logobj.output = output
        logobj.duration = duration
        logobj.from_cache = from_cache
        logobj.error = error
        logobj.save()
        return Response({"output": output, "uuid": logobj.id, "duration": duration, "from_cache": from_cache})
