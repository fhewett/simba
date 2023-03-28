from transformers import MT5ForConditionalGeneration, MT5Tokenizer
from .base_ml_model import BaseMLModel

# TODO: move these into a Singleton method in base_ml_models so they are only loaded on first view initialization
#  (and not everytime this file is read eg for manage.py migrate and such commands)
tokenizer = MT5Tokenizer.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")
transformer = MT5ForConditionalGeneration.from_pretrained("T-Systems-onsite/mt5-small-sum-de-en-v2")


class SummaryMT5TSys(BaseMLModel):
    """This is an abstract summary model based on the MT5 model finetuned by T-Systems
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
