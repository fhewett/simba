from datasets import load_dataset
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, PeftModel
from trl import SFTTrainer
import os
import re

# The dataset is a larger version of the files here: https://github.com/fhewett/apa-rst
# The whole dataset consists of 1500 articles, however we only train for 200 steps (800 articles)
dataset = load_dataset('json', data_files='mixed_data_shuffled_202408.jsonl', split="train[:80%]")
dataset.set_format("torch", device="cuda")

base_model_name = "meta-llama/Meta-Llama-3-8B-Instruct"

base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    torch_dtype=torch.float16,
    device_map="auto",
)

output_dir = "./simba_model"

device = "cuda:0"

peft_config = LoraConfig(
    lora_alpha=64,
    lora_dropout=0.1,
    r=32,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
)

tokenizer = AutoTokenizer.from_pretrained(base_model_name)
tokenizer.eos_token = "<|end_of_text|>"
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

training_args = TrainingArguments(
    output_dir=output_dir,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=1e-5,
    max_steps=200,
    lr_scheduler_type="cosine",
    adam_beta1=0.9,
    adam_beta2=0.95
)

def split_sentences(text):
  # The splitter below will split the text on new lines and periods,
  # (except in a number of cases: period after a number, "i.e.", period after capital etc.)
  # from here: https://github.com/brjezierski/scrapers/blob/51da6fa87879217c5676df87a5f28873ee8e0826/preprocess.py#L88C1-L100C19
  splitdots = re.split(r"(?<!\w\.\w.)(?<![0-9]\.)(?<![0-9][0-9]\.)(?<![A-Z]\.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s", text)

  return len(splitdots)

def formatting_prompts_func(example):
    # "level" is read from the dataset and is either B1 or A2
    output_texts = []
    system_prompt = "Du bist ein hilfreicher Assistent und hilfst dem User, Texte besser zu verstehen."
    for i in range(len(example['original'])):
        no_of_sentences = split_sentences(example['simplification'][i])
        level = example['level'][i]
        instruction = f"Kannst du bitte den folgenden Text sprachlich auf ein {level}-Niveau in Deutsch vereinfachen? Schreibe maximal {str(no_of_sentences)} Sätze.\n" #zusammenfassen und
        text = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n{instruction}{example['original'][i]}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n{example['simplification'][i]}<|eot_id|>"
        output_texts.append(text)
    return output_texts

trainer = SFTTrainer(
    model=base_model,
    train_dataset=dataset,
    peft_config=peft_config,
    tokenizer=tokenizer,
    formatting_func=formatting_prompts_func,
    args=training_args,
    max_seq_length=1024
)

if __name__ == '__main__':
    trainer.train()
    final_dir = os.path.join(output_dir, "final_checkpoint")
    trainer.save_model(final_dir)

    adapter_model_name = output_dir + "/final_checkpoint"
    model = PeftModel.from_pretrained(base_model, adapter_model_name)

    model = model.merge_and_unload()
    model.half()
    model.save_pretrained(output_dir + "/merged", torch_dtype=torch.float16)
