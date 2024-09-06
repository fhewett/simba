from time import time
import ipaddress
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from endpoints.db_models import APIRequestLog
from endpoints.lang_models import *


def index_view(request):
    text, output, uuid = "", "", ""
    
    if request.method == "POST":
        text = request.POST.get('text')
        # NOTE: perhaps we would want want to check for some minimum amount of text (and other validations)? 
        selected_model = request.POST.get('ModelDropdown')
        print(selected_model)
        userip = get_pseudo_user_ip(request)
        st = time()
        if selected_model == 'option-simba2409':
            model_dbsig = "llama3ft_runpod_v20240905"
            output = llama3ft_runpod_v20240905(text) 
        else:  
            # default fallback Llama-3
            model_dbsig = "llama3_together_v20240425"
            output = llama3_together_v20240425(text)  
        duration = round(time()-st, 2)
        print(f"Model {model_dbsig} called in {duration} sec (webform).")  # goes to log in GAE
        uuid = APIRequestLog.create_save(model_sig=model_dbsig,
                                  meta_data={"userip": userip, "src": "web"}, input_text=text, 
                                  output_text=output, duration=duration)

    return render(request, 'index.html', {'output': output, 'input': text, 'uuid': uuid})


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


def submit_feedback(request):
    if request.method == 'POST':
        thumb = request.POST.get('thumb') or ""
        uuid = request.POST.get('uuid') or ""
        fnotes = request.POST.get('fnotes') or ""
        if not thumb.upper() in ('D', 'U') or not uuid:
            return JsonResponse({'status': 'error', 'message': 'Bad or missing parameters'}, status=400)

        # record feedback
        obj = get_object_or_404(APIRequestLog, pk=uuid)
        obj.feedback_thumb = thumb[0].upper()
        obj.feedback_details = fnotes  # overrides earlier feedback on same UUID
        obj.save()    
        return JsonResponse({'status': 'success', 'message': 'Thank you for your feedback!'})
        
