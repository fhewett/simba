from transformers import MT5ForConditionalGeneration, MT5Tokenizer
from .base_ml_model import BaseMLModel
from ..utils import we_running_server

if we_running_server():
    # Only load models if server running (i.e. not if django doing migrations)
    # Future note: using intel's int8 optimization might help speed up inference on CPU
    tokenizer = MT5Tokenizer.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")
    transformer = MT5ForConditionalGeneration.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")
else:
    tokenizer = None
    transformer = None

class SummaryMT5TSys(BaseMLModel):
    """This is an abstractive summary model based on the MT5 model finetuned by T-Systems
        model card:  https://huggingface.co/T-Systems-onsite/mt5-small-sum-de-en-v2"""

    def __init__(self):
        self.name = "Sum-MT5-TSystems"
        self.SUMMARY_LEN = 150
        super().__init__()


    def process(self, text):
        input_ids = tokenizer.encode(text, return_tensors="pt")
        output = transformer.generate(input_ids=input_ids,
                                      max_length=self.SUMMARY_LEN,
                                      num_beams=4,
                                      length_penalty=2.0)
        summary = tokenizer.decode(output[0], skip_special_tokens=True)
        return summary
