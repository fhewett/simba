import os
from difflib import SequenceMatcher as SM
from openai import OpenAI
from transformers import AutoTokenizer
from .base_ml_model import BaseMLModel
from ..utils import split_sentences



class SummaryViaVLLM(BaseMLModel):
    # Model that uses OpenAI API method but directed to our own VLLM backend
    # 202402: this is again currently not used but kept in case 

    def __init__(self):
        self.name = "VLLM-simba-v01b"
        self.VLLM_MODEL = "hiig-piai/simba-v01b"
        self.VLLM_API_URL = "http://35.246.100.145:7001/v1"
        self.VLLM_API_KEY = os.environ.get('VLLM_API_KEY')
        self.MAX_LEN = 4096
        self.SUMMARY_LEN = 120
        self.TKZ = AutoTokenizer.from_pretrained(self.VLLM_MODEL)  # not sure re RAM use?
        super().__init__()


    def process(self, input_text):  
        input_text = self.truncate_text(input_text, self.MAX_LEN-self.SUMMARY_LEN-50)  # truncate to max token length for this API

        client = OpenAI(
            api_key = self.VLLM_API_KEY,
            base_url = self.VLLM_API_URL,
        )
        prompt = "Du bist ein hilfreicher Assistent.\nUSER: Kannst du folgenden Zeitungsartikel vereinfachen: \n"
        prompt += "```" + input_text + "```\nASSISTANT: "

        response = client.completions.create(model=self.VLLM_MODEL, prompt=prompt, max_tokens=120)  # set temperature=0.5
        output = response.choices[0].text  # this is just the model response (excludes prompt)
        # TODO: Re add this rule once we're sure re crash/empty outputs:  output = self.remove_repetitive_output(output)  
        
        return output


    def truncate_text(self, text, max_tokens):
        # Truncate the text if it exceeds the token limit
        tokens = self.TKZ.encode(text, add_special_tokens=False)
        if len(tokens) > max_tokens:
            tokens = tokens[:max_tokens]
            text = self.TKZ.decode(tokens, skip_special_tokens=True)
        return text
        

        return text


    def remove_repetitive_output(self, output):
        output_sents = split_sentences(output)
        outputs = ""
        sentences = list()
        for x in range(1,len(output_sents)):
            if SM(None, output_sents[x-1], output_sents[x]).ratio() < 0.6:
                if output_sents[x-1][-1] == ".":
                    if output_sents[x-1].replace("\n", "") not in sentences:
                        outputs += output_sents[x-1].replace("\n", "") + " "
                        sentences.append(output_sents[x-1].replace("\n", ""))
        return outputs