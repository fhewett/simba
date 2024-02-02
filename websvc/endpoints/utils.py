import sys
from somajo import SoMaJo

somajo_tokenizer = SoMaJo("de_CMC", split_camel_case=False, split_sentences=True)

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



def is_migration_running():
    return any(arg.endswith("manage.py") for arg in sys.argv) and "migrate" in sys.argv

def get_manage_py_command():
    if any(arg.endswith("manage.py") for arg in sys.argv):
        for arg in sys.argv[1:]:
            if not arg.startswith("-"):  # Ignore flags
                return arg
    return None
