from sentence_transformers import SentenceTransformer, util
import numpy as np
from LexRank import degree_centrality_scores
import spacy
nlp = spacy.load("de_dep_news_trf") #this model is better but slower

"""
Tried out the LexRank model (unsupervised) as recommended here https://dennis-aumiller.de/posts/cohere-summarization/
Code copied from here https://github.com/UKPLab/sentence-transformers/tree/master/examples/applications/text-summarization
The F1 score for the test corpus was much higher than the BERT model
Output at the moment is 3 sentences, can be easily changed
Model used is multilingual, however as we use a sentence splitter for german, the whole script may not work for other languages, can be easily modified
Tested it with an average length news article, seems to take ca. 0.7 seconds
"""

model = SentenceTransformer("symanto/sn-xlm-roberta-base-snli-mnli-anli-xnli")

def split_sentences(input_string):

    doc = nlp(input_string)

    sentences = list()
    for sent in doc.sents:
        if sent.text != '\n' and sent.text != ' ':
            sentences.append(sent.text)

    return sentences

def get_lex_rank_summary(input_text, sentences=True, model=model):

    if sentences == False:
        #split into sentences
        input_text = split_sentences(input_text)
        #print(input_text)

    #Compute the sentence embeddings
    embeddings = model.encode(input_text, convert_to_tensor=True)

    #Compute the pair-wise cosine similarities
    cos_scores = util.cos_sim(embeddings.cpu(), embeddings.cpu()).numpy()

    #Compute the centrality for each sentence
    centrality_scores = degree_centrality_scores(cos_scores, threshold=None)

    #We argsort so that the first element is the sentence with the highest score
    most_central_sentence_indices = np.argsort(-centrality_scores)

    #print(most_central_sentence_indices)

    summary = ""

    try:
        top_idx = most_central_sentence_indices[0:3]
        #print(top_idx)
        preds = np.zeros(centrality_scores.shape)
        preds[top_idx] = 1
        for idx in most_central_sentence_indices[0:3]:

            summary += input_text[idx].strip() + " "
        return summary, preds
        
    except IndexError: #less than 3 sentences??
        top_idx = most_central_sentence_indices
        #print(top_idx)
        preds = np.zeros(centrality_scores.shape)
        preds[top_idx] = 1

        for idx in most_central_sentence_indices:
            summary += input_text[idx].strip() + " "
        return summary, preds