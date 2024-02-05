import os
from difflib import SequenceMatcher as SM
from openai import OpenAI
# import tiktoken  # OpenAI's fast BPE Tokenizer
from .base_ml_model import BaseMLModel
from ..utils import split_sentences



class SummaryViaVLLM(BaseMLModel):
    # Model that uses OpenAI API method but directed to our own VLLM backend
    # 202402: this is again currently not used but kept in case 

    def __init__(self):
        self.name = "Sum-Via-VLLM"
        self.VLLM_MODEL = "hiig-piai/simba-v01b"
        self.VLLM_API_URL = "http://35.246.100.145:7001/v1"
        self.VLLM_API_KEY = os.environ.get('VLLM_API_KEY')
        self.MAX_LEN = 4096
        self.SUMMARY_LEN = 120
        super().__init__()


    def process(self, input_text):  
        trunc_text = self.truncate_text(input_text, self.MAX_LEN-self.SUMMARY_LEN-50)  # truncate to max token length for this API

        client = OpenAI(
            api_key = self.VLLM_API_KEY,
            base_url = self.VLLM_API_URL,
        )
        prompt = "Du bist ein hilfreicher Assistent.\nUSER: Kannst du folgenden Zeitungsartikel vereinfachen: \n"
        prompt += "```" + input_text + "```\nASSISTANT: "

        response = client.completions.create(model=self.VLLM_MODEL, prompt=prompt, max_tokens=120)  #  ... top=None, temperature=0.5,
        output = response.choices[0].text
        #output = response.choices[0].message['content'].strip()  # old
        # output = output.split("\nASSISTANT: ")[1]  # I think VLLM only returns the response so this is not needed
        # output = self.remove_repetitive_output(output)  # TODO: add once fixed
        
        return output


    def truncate_text(self, text, max_tokens):
        # Truncate the text if it exceeds the token limit
        # TODO: GOTO CHECK IF THIS IS NECESSARY? if so with which tokenizer? 
    #     enc = tiktoken.encoding_for_model(self.OPENAI_MODEL)
    #     tokens = enc.encode(text)
    #     if len(tokens) > max_tokens:
    #         tokens = tokens[:max_tokens]
    #         truncated_text = enc.decode(tokens)
    #         return truncated_text
         return text


    def remove_repetitive_output(self, output):
        # TODO: is this correct? looks like really wierd control logic/loop -- effectively seems to be only checking last two sentences? 
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