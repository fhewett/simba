from ..utils import split_sentences
from .base_ml_model import BaseMLModel


class SummaryDummy(BaseMLModel):
    """Dummy Model Returns First & Last Sentence of Text"""

    def __init__(self):
        self.name = "Sum-Dummy"
        super().__init__()

    def process(self, input_text):
        sentences = split_sentences(input_text)
        return sentences[0], sentences[-1]
