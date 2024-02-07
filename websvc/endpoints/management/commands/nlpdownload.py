# code to download and initialize pre-trained models
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Initialize pre-trained machine learning models'

    def handle(self, *args, **options):
        # Download NLTK & Spacy library files
        self.library_downloads()

    def library_downloads(self):
        try:
            import nltk
            nltk.download('punkt')
            nltk.download('stopwords')
        except Exception as e:
            print("nltk download failed")

        # HA: removed 202402 for GAE release
        # try:
        #     import spacy
        #     spacy.cli.download("de_core_news_sm")
        # except Exception as e:
        #     print("spacy download failed")

