# code to download and initialize pre-trained models
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Initialize pre-trained machine learning models'

    def handle(self, *args, **options):
        # Download NLTK & Spacy library files
        self.library_downloads()

    def library_downloads(self):
        # following is only necessary if one uses NLTK
        try:
            import nltk
            nltk.download('punkt')
            nltk.download('stopwords')
        except Exception as e:
            print("NLTK download failed: ", str(e))


