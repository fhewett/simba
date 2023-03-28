from .models import APIRequestLog
from django.contrib import admin

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'model', 'input_chars', 'output_chars', 'duration', 'error', 'feedback_yn']
    list_filter = ['model', 'feedback_yn']  # also 'timestamp', 'error', 'feedback_yn'
    # admin ui search bar: search_fields = ['']

    def input_chars(self, obj):
        return len(obj.input)

    def output_chars(self, obj):
        return len(obj.output)

