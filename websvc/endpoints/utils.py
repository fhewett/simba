import sys

def we_running_server():
    serving_debug = any(arg.endswith("manage.py") for arg in sys.argv) and "runserver" in sys.argv
    serving_gunicorn = any(arg.endswith("gunicorn") for arg in sys.argv)
    downloading_mode = any(arg.endswith("manage.py") for arg in sys.argv) and "nlpdownload" in sys.argv
    ret = serving_debug or serving_gunicorn or downloading_mode
    return ret

# TODO: make this a singleton and use it in base_ml_model (instead of loading from settings)
# SPACY_NLP = spacy.load("de_core_news_sm")

