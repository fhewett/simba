# SIMBA text assistant

## What is SIMBA?

The SIMBA Text Assistant is designed to improve your online reading experience. It is a plug-in that runs in your browser and provides summaries of the text found on web pages. Our models and code are open source. It has been designed for German-langugage text, but it may work on other languages.

## How does SIMBA work?

The plug-in supports two types of summaries: extractive, where the most important sentences are highlighted on the page, and abstractive, where a new text is generated which reflects the main points in the text. 
We offer both summaries as they both have their advantages: the extractive summary is guaranteed to be accurate, whereas the abstractive summary is a stand-alone text that should be more coherent.
The extractive summary is created using sentence embeddings from [SBERT](https://sbert.net/) and the [LexRank algorithm](https://github.com/crabcamp/lexrank/tree/dev), which is an unsupervised algorithm. The abstractive summary is created using ??, which has been fine-tuned with German-language newspaper articles.

## Known limitations

- SIMBA works best on shorter texts
- It has been created for German-language text: it may work on other languages, but it has not been designed to do so
- The abstractive summary may contain false information or ungrammatical phrases

## Credits

SIMBA has been created by members of the [AI & Society Lab](https://www.hiig.de/en/research/ai-and-society-lab/) at the [Humboldt Institute for Internet and Society](https://www.hiig.de/en/) in Berlin, Germany.
Hadi Asghari, Christopher Richter and Freya Hewett are responsible for the technical aspects, Larissa Wunderlich for the visuals, with general input from Theresa Züger.
If you have any questions, feedback or comments, get in touch with us at simba -at- hiig.de. More information can be found at the following page ([coming soon](https://publicinterest.ai/)).




