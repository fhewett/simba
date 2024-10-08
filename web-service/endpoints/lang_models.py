# The methods in this file call LLMs via a number of different API paths
import os
import re
from openai import OpenAI  # pip  
from together import Together  # pip 

MAX_NEW_TOKENS = 400  # model output len
MAX_MODEL_LEN = 4096-MAX_NEW_TOKENS-200  # model input len

# NOTE: if you make signifcant changes to the model being called, the prompt, or its parameters, it's better to
#       make a new function signature for tracking/analyis purposes (also in the db log)

# NOTE: both LLM models are currently tasked to return 5 sentences (also re MAX_NEW_TOKENS), 
#       but it might be better to set the number of sentences in porportion to the text (however, LLM will be slower)


def llama3_together_v20240425(input_text, meta_data=None):
    client = Together(api_key=os.environ.get('TOGETHER_API_KEY'))
    PROMPT = "Kannst du bitte den folgenden Text zusammenfassen und sprachlich auf ein A2-Niveau in Deutsch vereinfachen? Schreibe maximal 5 Sätze und nur auf Deutsch.\n``%TXT%``"
    response = client.chat.completions.create(
        model="meta-llama/Llama-3-8b-chat-hf",
        messages=[{"role": "user", 
                   "content": PROMPT.replace("%TXT%", truncate_filter(input_text, MAX_MODEL_LEN) )}],
        temperature=0,
        max_tokens=MAX_NEW_TOKENS
    )
    output = response.choices[0].message.content
    output = postprocess_basic(output)
    return output


def llama3ft_runpod_v20240905(input_text, meta_data=None):
    VLLM_URL = "https://api.runpod.ai/v2/vllm-xh6w0os87x2wfd/openai/v1"
    client = OpenAI(api_key=os.environ.get('RUNPOD_API_KEY'), base_url=VLLM_URL)
    PROMPT = """<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Du bist ein hilfreicher Assistent und hilfst dem User, Texte besser zu verstehen.<|eot_id|><|start_header_id|>user<|end_header_id|>
Kannst du bitte den folgenden Text zusammenfassen und sprachlich auf ein A2-Niveau in Deutsch vereinfachen? Schreibe maximal 5 Sätze und nur auf Deutsch.
``%TXT%``<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""
    response = client.completions.create(
        model="hiig-piai/simba_best_092024",
        prompt=PROMPT.replace("%TXT%", truncate_filter(input_text, MAX_MODEL_LEN) ),
        max_tokens=MAX_NEW_TOKENS,
        temperature=0,  # deterministic, better than temp=0.3, and much better then temp=0.6 top_p=0.9
    )
    if not response:
        # This retruend empty once, possibly due to slow cold-start (serverless)
        output = 'Error: backend server returned empty or timed out; Please try again.'
    else: 
        output = response.choices[0].text  # this is the model response excluding the prompt
        output = postprocess_basic(output)
    return output


def postprocess_basic(output):
    # basic post-processing. 
    # it might be better to get the model not to such sentences, or remove from `Hier` to `:\n`
    output = output.replace("Hier sind die 5 vollständigen Sätze:", "")
    output = output.replace("Hier ist der Text in 5 vollständigen Sätzen vereinfacht:", "")
    output = output.replace("Hier ist ein Text auf A2-Niveau in Deutsch:", "")
    output = output.replace("Hier ist ein zusammengefasster Text auf A2-Niveau:", "")
    output = output.replace("Hier ist eine Zusammenfassung des Textes auf A2-Niveau:", "")
    output = output.replace("Hier ist ein Zusammenfassung des Textes auf A2-Niveau:", "")
    output = output.replace("Hier ist ein Text, der auf A2-Niveau in Deutsch vereinfacht und zusammengefasst wurde:", "")
    output = output.replace("Hier ist ein Text, der auf ein A2-Niveau in Deutsch vereinfacht und zusammengefasst wurde:", "")
    output = output.replace("Hier ist ein Text, der den Originaltext auf ein A2-Niveau in Deutsch vereinfacht und auf 5 Sätze reduziert:", "")
    output = output.replace("Hier ist ein Text, der den Originaltext auf ein A2-Niveau in Deutsch vereinfacht und zusammengefasst:", "")
    output = output.replace("Hier ist ein Text, der den Originaltext zusammenfasst und auf ein A2-Niveau in Deutsch vereinfacht:", "")    
    output = output.replace("Hier ist ein Text, der den Originaltext auf ein A2-Niveau in Deutsch vereinfacht und auf maximal 5 Sätze reduziert:", "")    
    output = output.replace("Leider ist der Text sehr kurz und enthält nur ein Wort. Hier ist eine mögliche Zusammenfassung und Vereinfachung auf A2-Niveau:", "")
    output = output.replace("Here is a summary of the text in 5 sentences, written at an A2 level in German:", "")
    output = output.replace("Here is a summary of the text in 5 sentences, written at an A2 level:", "")
    output = output.replace("Here is a summary of the text in 5 sentences, written in simple language and at an A2 level:", "")
    output = output.replace("Here is a summary of the text in 5 sentences, written in a simplified language and at an A2 level:", "")
    # maybe also at end: output = output.replace("Ich hoffe, das hilft! Lassen Sie mich wissen, wenn Sie weitere Fragen haben.", "")
    output = output.strip()
    return output


def truncate_filter(text, max_tokens):
    # Truncate the text if it exceeds the token limit
    # - uses the rough word count formula `800 words ~= 1000 tokens` (instead of accurate tokenization for speed/memory)
    # - also removes the newlines which is okay for text simplification/summarization
    # - note for some models the ratio might be more like 1:2 in which case pass in a smaller max_tokens (Llama-3-* okay)
    text = text.replace("\r\n", "\n")  # in case
    # perhaps necessary: text = text.replace('\u00A0', ' ')   # fix nbsp 
    max_words = (max_tokens * 800) // 1000 
    words = text.split() 
    truncated = words[:max_words]
    text = " ".join(truncated)
    return text
    



