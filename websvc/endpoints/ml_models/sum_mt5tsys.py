from transformers import MT5ForConditionalGeneration, MT5Tokenizer
from .base_ml_model import BaseMLModel
from ..utils import we_running_server

if we_running_server():
    # Only load models if server running (i.e. not if django doing migrations)
    # Future note: using intel's int8 optimization might help speed up inference on CPU
    tokenizer = MT5Tokenizer.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")  # 0.5s, once
    model = MT5ForConditionalGeneration.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")  # 6.3s, once
else:
    tokenizer = None
    model = None

class SummaryMT5TSys(BaseMLModel):
    """This is an abstractive summary model based on the MT5 model finetuned by T-Systems
        model card:  https://huggingface.co/T-Systems-onsite/mt5-small-sum-de-en-v2"""

    def __init__(self):
        self.name = "Sum-MT5-TSystems"
        self.SUMMARY_LEN = 120  # 120 tokens, compromise fast/quality
        self.MAX_INPUT_LEN = 512  # 512 tokens, typical max for MT5
        super().__init__()


    def process(self, text):
        input_ids = tokenizer.encode(text,
                                     return_tensors="pt",
                                     max_length=self.MAX_INPUT_LEN,
                                     truncation=True)  # 2ms
        output = model.generate(input_ids=input_ids,
                                max_new_tokens=self.SUMMARY_LEN,
                                repetition_penalty=1.5,
                                do_sample=False)
        summary = tokenizer.decode(output[0], skip_special_tokens=True)
        return summary
