import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

from transformers import AutoTokenizer, AutoModel
sentence_model_name = "symanto/sn-xlm-roberta-base-snli-mnli-anli-xnli"
tokenizer = AutoTokenizer.from_pretrained(sentence_model_name)

from torch import cuda
device = 'cuda' if cuda.is_available() else 'cpu'

import spacy
nlp = spacy.load("de_dep_news_trf")


# get mean pooling for sentence bert models
# ref https://www.sbert.net/examples/applications/computing-embeddings/README.html#sentence-embeddings-with-transformers
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0] #First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask


class SentenceBertClass(torch.nn.Module):
    def __init__(self, model_name=sentence_model_name, in_features=768):
        super(SentenceBertClass, self).__init__()
        self.l1 = AutoModel.from_pretrained(model_name)
        self.pre_classifier = torch.nn.Linear(in_features*3, 768)
        self.dropout = torch.nn.Dropout(0.3)
        self.classifier = torch.nn.Linear(768, 1)
        #self.classifierSigmoid = torch.nn.Sigmoid()

    def forward(self, sent_ids, doc_ids, sent_mask, doc_mask):

        sent_output = self.l1(input_ids=sent_ids, attention_mask=sent_mask)
        sentence_embeddings = mean_pooling(sent_output, sent_mask)

        doc_output = self.l1(input_ids=doc_ids, attention_mask=doc_mask)
        doc_embeddings = mean_pooling(doc_output, doc_mask)

        # elementwise product of sentence embs and doc embs
        combined_features = sentence_embeddings * doc_embeddings

        # Concatenate input features and their elementwise product
        concat_features = torch.cat((sentence_embeddings, doc_embeddings, combined_features), dim=1)

        pooler = self.pre_classifier(concat_features)
        pooler = torch.nn.ReLU()(pooler)
        pooler = self.dropout(pooler)
        output = self.classifier(pooler)
        #output = self.classifierSigmoid(output)

        return output
    

# tokenize text as required by BERT based models
def get_tokens(text, tokenizer):
  inputs = tokenizer.batch_encode_plus(
            text, 
            add_special_tokens=True,
            max_length=512,
            padding="max_length",
            return_token_type_ids=True,
            truncation=True
        )
  ids = inputs['input_ids']
  mask = inputs['attention_mask']
  return ids, mask



def predict(model,sents, doc):
  sent_id, sent_mask = get_tokens(sents,tokenizer)
  sent_id, sent_mask = torch.tensor(sent_id, dtype=torch.long),torch.tensor(sent_mask, dtype=torch.long)
 
  doc_id, doc_mask = get_tokens([doc],tokenizer)
  doc_id, doc_mask = doc_id * len(sents), doc_mask* len(sents)
  doc_id, doc_mask = torch.tensor(doc_id, dtype=torch.long),torch.tensor(doc_mask, dtype=torch.long)

  preds = model(sent_id, doc_id, sent_mask, doc_mask)
  return preds


model_path = "first_try.pth"
extractive_model = SentenceBertClass() 
extractive_model.load_state_dict(torch.load(model_path, map_location=torch.device(device) ))
extractive_model.eval(); 


def summarize(doc, model, top_k=3, batch_size=3):
  doc = doc.replace("\n","")
  doc_sentences = []
  for sent in nlp(doc).sents:
      doc_sentences.append(str(sent))
  
  doc_id, doc_mask = get_tokens([doc],tokenizer)
  doc_id, doc_mask = doc_id * batch_size, doc_mask* batch_size
  doc_id, doc_mask = torch.tensor(doc_id, dtype=torch.long),torch.tensor(doc_mask, dtype=torch.long)

  scores = [] 
  # run predictions using some batch size
  for i in range(int(len(doc_sentences) / batch_size) + 1):
    batch_start = i*batch_size  
    batch_end = (i+1) * batch_size if (i+1) * batch_size < len(doc) else len(doc)-1
    batch = doc_sentences[batch_start: batch_end]
    if batch:
      preds = predict(model, batch, doc) 
      scores = scores + preds.tolist() 
 
  sent_pred_list = [{"sentence": doc_sentences[i], "score": scores[i][0], "index":i} for i in range(len(doc_sentences))]
  sorted_sentences = sorted(sent_pred_list, key=lambda k: k['score'], reverse=True) 

  sorted_result = sorted_sentences[:top_k] 
  sorted_result = sorted(sorted_result, key=lambda k: k['index']) 
  
  summary = [ x["sentence"] for x in sorted_result]
  summary = " ".join(summary)

  return summary, scores, doc_sentences



# Sample usage
#article = """Wie schwierig es ist, in dieser Region einen Ausbildungsplatz zu finden, haben wir an dieser und anderer Stelle oft und ausführlich bewertet. Trotzdem bemühen sich Unternehmen sowie die Industrie- und Handelskammer Potsdam den Schulabgängern Wege in die Ausbildung aufzuzeigen. Der "Berufemarkt" - erstmals in der Aula der Gesamtschule "Am Weinberg" angeboten - war ein guter und sinnvoller Beitrag. Das hat allein das Interesse der Schülerinnen und Schüler bewiesen.

#Noch etwas hat der "Berufemarkt" ans Licht gebracht. Die Vertreter der "Null-Bock-Generation" mag es wohl geben, viele - wohl die meisten - wollen es aber mit einer Lehre versuchen und sind guten Willens sich bei der Suche nach einem Ausbildungsplatz entsprechend anzustrengen.

#Das sollte honoriert werden indem möglichst viele Betriebe - trotz aller wirtschaftlichen Probleme, die in den nächsten zwei Jahren vor der Türe stehen - intensiv ausbilden. Längst ist der Zeitpunkt absehbar, zu dem gute Facharbeiter ins Land geholt werden müssen, um Lücken in Unternehmen zu füllen. Das wäre überflüssig, wenn deutsche Fachkräfte jetzt ausgebildet werden. """

#summary, scores, sentences = summarize(article, extractive_model, top_k=3, batch_size=1)
