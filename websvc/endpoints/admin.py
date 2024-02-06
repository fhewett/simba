from .models import APIRequestLog
from django.contrib import admin

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'url', 'model', 'input_words', 'input_chars', 'output_words', 'output_chars', 'duration', 'feedback_thumb']
    list_filter = ['model', 'feedback_thumb', 'from_cache']  # also 'timestamp', 'error', 'feedback_yn'
    ordering = ['-timestamp']
    # admin ui search bar: search_fields = ['']

    def url(self, obj):
        return obj.meta_url[:40]

    def input_chars(self, obj):
        return len(obj.input)

    def output_chars(self, obj):
        return len(obj.output)
    
    def input_words(self, obj):
        return len(obj.input.split())

    def output_words(self, obj):
        return len(obj.output.split())

