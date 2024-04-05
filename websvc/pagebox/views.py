from django.shortcuts import render
from django.http import HttpResponse
from endpoints.ml_models import sum_via_vllm

def index(request):
    output = ""
    text = ""
    if request.method == "POST":
        text = request.POST.get('text')
        #data = {"text": "text", "url": "pagebox-entry"}
        vllm = sum_via_vllm.SummaryViaVLLM()
        output = vllm.process(text)  # TODO: this won't log to db though, so we'd want to call .post()
        output = output.strip()

    return render(request, 'index.html', {'output': output, 'input': text})