import os
# from huggingface_hub.inference_api import InferenceApi  # needs this which I think is part of transformers
from .base_ml_model import BaseMLModel

class SummaryViaHFIE(BaseMLModel):
    # This models calls the a model via the HuggingFace Inference EndPoints
    # It is not currently used but kept as an example in case we go this path

    def __init__(self):
        self.name = "Sum-MT5-TSystems-viaHF"
        self.SUMMARY_LEN = 120
        HF_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')
        # particular model: https://huggingface.co/T-Systems-onsite/mt5-small-sum-de-en-v2"""
        self.hf_api = InferenceApi(repo_id="T-Systems-onsite/mt5-small-sum-de-en-v2", token=HF_API_KEY)
        super().__init__()


    def process(self, text):
        summary = self.hf_api(text, params={"max_new_tokens":self.SUMMARY_LEN}, wait_for_model=True)
        return summary[0]['summary_text']







