from huggingface_hub.inference_api import InferenceApi
from .base_ml_model import BaseMLModel

HF_API_KEY = os.environ.get('HUGGINGFACE_API_KEY')

class SummaryMT5TSysVHF(BaseMLModel):
    """This models calls the MT5 summarized finetuned by T-Systems via the HuggingFace Inference API.
        model card:  https://huggingface.co/T-Systems-onsite/mt5-small-sum-de-en-v2"""

    def __init__(self):
        self.name = "Sum-MT5-TSystems-viaHF"
        self.SUMMARY_LEN = 120
        self.hf_api = InferenceApi(repo_id="T-Systems-onsite/mt5-small-sum-de-en-v2",
                                   token=HF_API_KEY)
        super().__init__()


    def process(self, text):
        summary = self.hf_api(text, params={"max_new_tokens":self.SUMMARY_LEN}, wait_for_model=True)
        return summary[0]['summary_text']







