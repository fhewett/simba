from .db_models import APIRequestLog
from django.contrib import admin

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'model', 'input_chars', 'output_chars', 'duration', 'error', 'feedback_thumb']
    list_filter = ['model', 'feedback_thumb']  # also 'timestamp', 'error'
    ordering = ['-timestamp']
    # admin ui search bar: search_fields = ['']

    def input_chars(self, obj):
        return len(obj.input)

    def output_chars(self, obj):
        return len(obj.output)

