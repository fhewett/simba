from django.urls import path, include
# from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from . import inference

@csrf_exempt
@api_view(['POST'])  # only POST; note REST security must allow
@parser_classes([JSONParser])    # only JSON
def summarize_sentemb(request):
    doc = str(request.data)
    top_sents, dbg_scores, dbg_sents = inference.summarize(doc)
    return Response(top_sents)


@csrf_exempt
@api_view(['POST'])
@parser_classes([JSONParser])
def summarize_dummy(request):
    # DUMMY FUNCTION FOR TESTING PURPOSES. RETURNS FIRST & LAST SENTENCES
    doc = str(request.data).replace("\n", "")
    doc_sentences = []
    for sent in inference.nlp(doc).sents:
        doc_sentences.append(str(sent))
    top_sents = [doc_sentences[0], doc_sentences[-1]]
    print(top_sents)
    return Response(top_sents)

urlpatterns = [
    path('sum-wse', summarize_sentemb),
    path('sum-dum', summarize_dummy),
    #path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]