import numpy as np
from scipy.sparse.csgraph import connected_components
from scipy.special import softmax
from sentence_transformers import SentenceTransformer, util
from .base_ml_model import BaseMLModel
from django.conf import settings

transformer = SentenceTransformer('symanto/sn-xlm-roberta-base-snli-mnli-anli-xnli')


class SummaryLexRank(BaseMLModel):
    """This is a lex rank model based on sentence transformers.

    Please note that while the transformer used is multilingual, the sentence splitter is for German, so
    the model may have unexpected results for other languages"""

    # Notes:
    # Tried the LexRank model (unsupervised) as recommended by:
    # https://dennis-aumiller.de/posts/cohere-summarization/
    # Code borrowed from:
    # https://github.com/UKPLab/sentence-transformers/tree/master/examples/applications/text-summarization
    # The F1 score for the test corpus was much higher than the BERT model.
    # Tested with an average length news article  takes about 0.7 seconds

    def __init__(self):
        self.name = "Sum-LexRank"
        self.TOP_SENTENCES = 3  # can be changed
        super().__init__()

    def process(self, input_text):
        # split into sentences
        nlp = settings.SPACY_NLP
        input_sents = list()
        for sent in nlp(input_text).sents:
            if sent.text != '\n' and sent.text != ' ':
                input_sents.append(sent.text)

        # Compute the sentence embeddings
        # TODO: @hadi @freya does this not need padding and trunctation?
        print(len(input_sents))
        embeddings = transformer.encode(input_sents, convert_to_tensor=True).cpu()
        print(type(embeddings), embeddings.shape)

        # Compute the pairwise cosine similarities
        cos_scores = util.cos_sim(embeddings, embeddings).numpy()
        print(cos_scores.shape)

        # Compute the centrality for each sentence
        centrality_scores = self.degree_centrality_scores(cos_scores)
        print(centrality_scores.shape)

        # Use argsort so that the first element is the sentence with the highest score
        most_central_sentence_indices = np.argsort(-centrality_scores)
        print(most_central_sentence_indices.shape)

        summary = []
        try:
            top_idx = most_central_sentence_indices[:self.TOP_SENTENCES]
            for idx in most_central_sentence_indices[:self.TOP_SENTENCES]:
                summary.append(input_sents[idx].strip())
        except IndexError: # less than 3 sentences??
            top_idx = most_central_sentence_indices
            for idx in most_central_sentence_indices:
                summary.append(input_sents[idx].strip())

        return summary

    def degree_centrality_scores(self, similarity_matrix):
        markov_matrix = self.create_markov_matrix(similarity_matrix)
        scores = self.stationary_distribution(markov_matrix, increase_power=True, normalized=False)
        return scores

    def create_markov_matrix(self, weights_matrix):
        if weights_matrix.shape[0] != weights_matrix.shape[1]:
            raise ValueError('\'weights_matrix\' should be square')
        row_sum = weights_matrix.sum(axis=1, keepdims=True)
        # normalize probability distribution differently if we have negative transition values
        if np.min(weights_matrix) <= 0:
            return softmax(weights_matrix, axis=1)
        return weights_matrix / row_sum

    def stationary_distribution(self, transition_matrix, increase_power, normalized):
        n_1, n_2 = transition_matrix.shape
        if n_1 != n_2:
            raise ValueError('\'transition_matrix\' should be square')
        distribution = np.zeros(n_1)
        grouped_indices = self.connected_nodes(transition_matrix)
        for group in grouped_indices:
            t_matrix = transition_matrix[np.ix_(group, group)]
            eigenvector = self.power_method(t_matrix, increase_power=increase_power)
            distribution[group] = eigenvector
        if normalized:
            distribution /= n_1
        return distribution

    def power_method(self, transition_matrix, increase_power=True, max_iter=10000):
        eigenvector = np.ones(len(transition_matrix))
        if len(eigenvector) == 1:
            return eigenvector
        transition = transition_matrix.transpose()
        for _ in range(max_iter):
            eigenvector_next = np.dot(transition, eigenvector)
            if np.allclose(eigenvector_next, eigenvector):
                return eigenvector_next
            eigenvector = eigenvector_next
            if increase_power:
                transition = np.dot(transition, transition)
        # logger.warning("Maximum number of iterations for power method exceeded without convergence!")
        return eigenvector_next

    def connected_nodes(self, matrix):
        _, labels = connected_components(matrix)
        groups = []
        for tag in np.unique(labels):
            group = np.where(labels == tag)[0]
            groups.append(group)
        return groups


