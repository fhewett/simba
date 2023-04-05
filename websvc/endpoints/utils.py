import sys

def we_running_server():
    server_django_debug = any(arg.endswith("manage.py") for arg in sys.argv) and "runserver" in sys.argv
    server_gunicorn = any(arg.endswith("gunicorn") for arg in sys.argv)
    download_mode = any(arg.endswith("manage.py") for arg in sys.argv) and "nlpdownload" in sys.argv
    return server_django_debug or server_gunicorn or download_mode

# TODO: make this a singleton and use it in base_ml_model (instead of loading from settings)
# SPACY_NLP = spacy.load("de_core_news_sm")

