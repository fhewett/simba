from django.shortcuts import get_object_or_404

from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from .models import APIRequestLog

class Feedback(APIView):
    """Store feedback from user for a particular model output (stored in db as apilog)"""

    def __init__(self):
        super().__init__()

    def __call__(self, request, *args, **kwargs):
        return self.dispatch(request, *args, **kwargs)

    # GET not supported

    @csrf_exempt
    @parser_classes([JSONParser])  # only JSON
    def post(self, request, *args, **kwargs):
        #if type(request.data) is dict:
        uuid = request.data.get("uuid", "")
        thumb = request.data.get("thumb", "?")  # up/dn
        notes = request.data.get("fnotes", "")

        obj = get_object_or_404(APIRequestLog, pk=uuid)
        if obj.feedback_thumb:
            # there shouldn't really be a feedback already stored, but to be safe lets not override.
            obj.feedback_details = "\n---\nEarlier: " + obj.feedback_thumb + "\n" + obj.feedback_details

        obj.feedback_thumb = thumb[0].upper()
        obj.feedback_details = notes + obj.feedback_details
        obj.save()

        # technically 204 means successfully processed w/o content but 200 is more common
        return Response(status=200)
