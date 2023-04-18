from .db_models import APIRequestLog
from django.contrib import admin

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'url', 'model', 'input_chars', 'output_chars', 'duration', 'feedback_thumb']
    list_filter = ['model', 'feedback_thumb']  # also 'timestamp', 'error'
    ordering = ['-timestamp']
    # admin ui search bar: search_fields = ['']

    def url(self, obj):
        return obj.meta_url[:40]

    def input_chars(self, obj):
        return len(obj.input)

    def output_chars(self, obj):
        return len(obj.output)

