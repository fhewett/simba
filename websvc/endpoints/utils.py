import sys
from somajo import SoMaJo

somajo_tokenizer = SoMaJo("de_CMC", split_camel_case=False, split_sentences=True)
# note, for English, en_PTB is needed. but then language has to be detected

def split_sentences(input_text, max_sentences=None, max_tokens=None):
    sentences = somajo_tokenizer.tokenize_text(input_text.splitlines())
    output_sentences = []
    output_tokens = 0
    for s in sentences:
        out_s = ""
        for tok in s:
            if tok.original_spelling is not None:
                out_s += tok.original_spelling
            else:
                out_s += tok.text
            if tok.space_after:
                out_s += " "
            output_tokens += 1
        output_sentences.append(out_s)
        if (max_tokens and output_tokens >= max_tokens) or (max_sentences and len(output_sentences) >= max_sentences):
            break
    return output_sentences


def we_running_server():
    serving_debug = any(arg.endswith("manage.py") for arg in sys.argv) and "runserver" in sys.argv
    serving_gunicorn = any(arg.endswith("gunicorn") for arg in sys.argv)
    downloading_mode = any(arg.endswith("manage.py") for arg in sys.argv) and "nlpdownload" in sys.argv
    ret = serving_debug or serving_gunicorn or downloading_mode
    return ret

# TODO: make this a singleton and use it in base_ml_model (instead of loading from settings)
# SPACY_NLP = spacy.load("de_core_news_sm")

