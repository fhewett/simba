# This file contains the database class (name is Django convention)
from django.db import models

class APIRequestLog(models.Model):
    id = models.CharField(max_length=255, primary_key=True)  # use a UUID for security/privacy on feedback
    timestamp = models.DateTimeField(auto_now_add=True)  # when request has been made
    model = models.CharField(max_length=255)  # which ml model was used
    meta_url = models.TextField(default="")  # the cleaned URL, or an exception code
    input = models.TextField()  # input text
    output = models.TextField(default="")  # model output (e.g. summary)
    duration = models.FloatField()  # how long the model took to run
    error = models.TextField(default="")  # whether a warning, error, or exception occurred
    feedback_thumb = models.CharField(max_length=1, default="", null=True)  # whether user has provided thumbs up/dn feedback
    feedback_details = models.TextField(default="")  # user feedback

    def __str__(self):
        return f"APIRequest<{self.id}>"

