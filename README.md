# SIMBA text assistant

## What is SIMBA?

The Simba Text Assistant is a browser plug-in that produces summaries of German-language text on web pages. It is designed to additionally simplify the summaries, by shortening the sentences and providing explanations for words. We have also integrated the [Hurraki dictionary](https://hurraki.de/wiki/Hauptseite); a Wiki-based dictionary with entries in Leichte Sprache (Easy German Language). You can choose to highlight words found in the dictionary and in the online text, and be shown their definition in Easy Language.

Our models and code are open source. It has been designed for German-language text, but it may work on other languages.

## How does SIMBA work?

There are different ways of automatically creating a summarisation, SIMBA is based on a so-called “text generation” model. These text generation models are also referred to as Large Language Models or foundation models: ChatGPT and Llama are examples of these. They are very large neural networks that are fed with a large amount of text data. These networks are trained to calculate what word is most likely to come next in a sequence. 
We used German-language newspaper articles that have been simplified to fine-tune the foundation model from Mistral. We use articles from the Austrian Press Agency, which have been simplified by professional translators. They are simplified to the levels B1 and A2 on the Common European Framework of Reference for Languages (CEFR). A sample of the dataset can be found [here](https://github.com/fhewett/apa-rst/tree/main/original_texts). 

## Known limitations

- SIMBA works best on shorter texts
- It has been created for German-language text: it may work on other languages, but it has not been designed to do so
- The summary may contain false information or ungrammatical phrases

## Project structure

We use django (Python) on the backend, these files are in the *websvc* folder. The plug-in code is in Javascript and can be found in the folder *highlighter-plugin*.

## Credits

SIMBA has been created by members of the [AI & Society Lab](https://www.hiig.de/en/research/ai-and-society-lab/) at the [Humboldt Institute for Internet and Society](https://www.hiig.de/en/) in Berlin, Germany.
Hadi Asghari, Christopher Richter and Freya Hewett are responsible for the technical aspects, Larissa Wunderlich for the visuals, with general input from Theresa Züger.

If you have any questions, feedback or comments, get in touch with us at simba -at- hiig.de. More information can be found [on our website](https://publicinterest.ai/tool/simba).
