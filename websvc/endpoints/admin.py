from .db_models import APIRequestLog
from django.contrib import admin

@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'model_sig', 'input_words', 'output_words', 'duration', 'feedback_thumb']
    list_filter = ['model_sig', 'feedback_thumb']  
    ordering = ['-timestamp']
    # admin ui search bar: search_fields = ['']
    
    def input_words(self, obj):
        return len(obj.input.split())

    def output_words(self, obj):
        return len(obj.output.split())

