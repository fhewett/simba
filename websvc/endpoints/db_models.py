# This file contains the database class
import uuid
import time
from django.db import models


def gen_comb():
    # Generate a COMB: a random UUID where a part is replaced with a timestamp.
    # - This has the benefit of being unique: good for security/privayc
    # - and semi-sequential: helpful for mysql performance
    random_uuid = uuid.uuid4()
    timestamp = int(time.time() * 1e6)
    time_uuid = (timestamp << 64) | random_uuid.int
    comb = uuid.UUID(int=time_uuid)
    return comb.hex


class APIRequestLog(models.Model):
    id = models.CharField(max_length=32, primary_key=True)  # COMB-id for feedback
    timestamp = models.DateTimeField(auto_now_add=True)  # when request has been made
    model = models.CharField(max_length=255)  # which ml model was used
    browser_id = models.CharField(max_length=255, default="")  # the browser id (pseudonymous)
    meta_url = models.TextField(default="")  # the cleaned URL, or an exception code
    input = models.TextField()  # input text
    output = models.TextField(default="")  # model output (e.g. summary)
    from_cache = models.BooleanField(default=False)  # whether the model output was read from cache
    duration = models.FloatField(null=True)  # how long the model took to run
    error = models.TextField(default="")  # whether a warning, error, or exception occurred
    feedback_thumb = models.CharField(max_length=1, default="",
                                      null=True)  # whether user has provided thumbs up/dn feedback
    feedback_details = models.TextField(default="")  # user feedback

    def __str__(self):
        return f"APIRequest<{self.id}>"
