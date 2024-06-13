# This file contains the database class
import uuid
import json
from time import time
from django.db import models


def gen_comb():
    # Generate a COMB: a random UUID where a part is replaced with a timestamp.
    # - This has the benefit of being unique: good for security/privayc
    # - and semi-sequential: helpful for mysql performance
    random_uuid = uuid.uuid4()
    timestamp = int(time() * 1e6)
    time_uuid = (timestamp << 64) | random_uuid.int
    comb = uuid.UUID(int=time_uuid)
    return comb.hex


class APIRequestLog(models.Model):
    id = models.CharField(max_length=40, primary_key=True)  # use a UUID for security/privacy on feedback
    timestamp = models.DateTimeField(auto_now_add=True)  # when request has been made
    model_sig = models.CharField(max_length=255)  # which ml model/api was called (note: use dated signature so parameters can be traced) 
    meta_data = models.TextField(default="")  # metadata as dict/json (cleaned_url, pseudo_browser_id, santized_ip)
    input = models.TextField()  # input text
    output = models.TextField(default="")  # model output (the simplified & summarized text)
    duration = models.FloatField(null=True)  # how long the model/api took to run - in sec
    # removed: from_cache = models.BooleanField(default=False)  # whether the model output was read from cache
    # removed: error = models.TextField(default="")  # whether a warning, error, or exception occurred
    feedback_thumb = models.CharField(max_length=1, default="", null=True, blank=True)  # whether user has provided feedback
    feedback_details = models.TextField(default="", null=True, blank=True)  # user feedback (note: this can be saved as a dict/json)

    def __str__(self):
        return f"APIRequest<{self.id}>"
    
    @staticmethod
    def create_save(model_sig, meta_data, input_text, output_text, duration):
        # log to database model APIRequestLog --> this is done in the lang_models call itself now
        logobj = APIRequestLog.objects.create(
            id=gen_comb(),
            model_sig=model_sig,
            meta_data=meta_data,  # TODO: json.dumps or str()
            input=input_text,
            output=output_text,
            duration=duration,
        )
        logobj.save()
        return logobj.id   

