from time import time
import ipaddress
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.cache import cache  
from rest_framework.views import APIView
from rest_framework.parsers import JSONParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import parser_classes
from .db_models import APIRequestLog
from .lang_models import *


class RestSimplifyApi(APIView):
    """Summarizes & simplifies inputed text via an ML model (chosen by backend); Logs to database."""

    def __init__(self):
        super().__init__()

    def __call__(self, request, *args, **kwargs):
        return self.dispatch(request, *args, **kwargs)

    @csrf_exempt
    @parser_classes([JSONParser, FormParser])
    def post(self, request, *args, **kwargs):
        # Handle the REST API request here (e.g. coming from the browser extension) 
        text = request.data.get("text", "")  if type(request.data) is dict else str(request.data)
        url = request.data.get("url", "") if type(request.data) is dict else ""
        url = url.split("?")[0]  # cutoff possibly private part of URL (after ?)
        userip = get_pseudo_user_ip(request)

        # note: pre-processing of the input coming from the browser (readability) appears tobe unnecessary with latest models
        st = time()
        output = llama3_together_v20240425(text)  
        duration =round(time()-st, 2)
        print(f"Model `llama3_together_v20240425` called in  {duration} sec (RESTAPI).")  # apparently prints go to log in GAE
        uuid = APIRequestLog.create_save(model_sig="llama3_together_v20240425",
                                  meta_data={"userip": userip, "browser_url": url, "src": "api"}, 
                                  input_text=text, output_text=output, duration=duration)
        return Response({"output":output, "uuid": uuid})
    

def get_pseudo_user_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    ip = x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR')
    # now pseudonomize half the IPv4/v6 address
    ip_obj = ipaddress.ip_address(ip)
    if ip_obj.version == 4:  # IPv4
        ip_parts = ip.split('.')
        ip_parts[2] = '0'
        ip_parts[3] = '0'
        modified_ip = '.'.join(ip_parts)
    elif ip_obj.version == 6:  # IPv6
        ip_bin = ip_obj.packed  # convert to binary
        modified_bin = ip_bin[:-8] + (b'\x00' * 8)  # Zero last 64 bits 
        modified_ip = str(ipaddress.ip_address(modified_bin)) 
    return modified_ip


class RestFeedbackApi(APIView):
    """Store feedback from user for a particular model output"""

    def __init__(self):
        super().__init__()

    def __call__(self, request, *args, **kwargs):
        return self.dispatch(request, *args, **kwargs)

    @csrf_exempt
    @parser_classes([JSONParser])  # only JSON
    def post(self, request, *args, **kwargs):
        print("DBG RestFeedbackApi.post():", request.data) 
        uuid = request.data.get("uuid", "")
        thumb = request.data.get("thumb", "?")  # up/dn
        fnotes = request.data.get("fnotes", "")

        obj = get_object_or_404(APIRequestLog, pk=uuid)
        if obj.feedback_thumb:
            # there shouldn't really be a feedback already stored, but to be safe lets not override.
            obj.feedback_details = "\n---\nEarlier: " + obj.feedback_thumb + "\n" + obj.feedback_details
        obj.feedback_thumb = thumb[0].upper()
        obj.feedback_details = fnotes + obj.feedback_details
        obj.save()
        return Response(status=200)

