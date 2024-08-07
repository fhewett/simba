# SIMBA Text Assistent

[The English version can be found below](#simba-text-assistant)

## Was ist der SIMBA Text Assistent?

Der Simba Text Assistent ist ein Browser-Extension und Weboberfläche, der Zusammenfassungen von deutschsprachigen Texten auf Webseiten erstellt. Er wurde entwickelt, um die Zusammenfassungen zusätzlich zu vereinfachen, indem er die Sätze verkürzt und schwierige Wörter vermeidet.

Unsere Modelle und unser Code sind Open Source.
Die Zielgruppen von vereinfachten Sprache reichen von Menschen mit Lernschwierigkeiten über Nicht-Muttersprachler*innen bis hin zu Kindern und Laien. Der „gesellschaftliche Zweck“ der vereinfachten Sprache besteht also darin, möglichst vielen verschiedenen Menschen Zugang zu denselben Informationen zu verschaffen.

## Wie funktioniert SIMBA?

Es gibt verschiedene Möglichkeiten, eine Zusammenfassung automatisch zu erstellen, Simba basiert auf einem sogenannten "Textgenerierungsmodell". Diese Textgenerierungsmodelle werden auch als Large Language Models oder Foundation Models bezeichnet: ChatGPT und Llama sind Beispiele für diese Modelle. Es handelt sich um sehr große neuronale Netze, die mit einer großen Menge von Textdaten gefüttert werden. Diese Netze werden darauf trainiert, zu berechnen, welches Wort in einer Sequenz am wahrscheinlichsten als nächstes kommt.
Wir haben deutschsprachige Zeitungsartikel verwendet, die zur Fine-Tuning des Grundmodells Llama-3-8B-Instruct vereinfacht wurden. Wir verwenden Artikel der Austrian Press Agency, die von professionellen Übersetzer*innen vereinfacht wurden. Sie wurden auf die Niveaus B1 und A2 des Gemeinsamen Europäischen Referenzrahmens für Sprachen (GER) vereinfacht. Ein Beispiel für den Datensatz findet sich [hier](https://github.com/fhewett/apa-rst/tree/main/original_texts).

## Die Grenzen von SIMBA

- SIMBA ist für deutschsprachige Texte optimiert
- Die automatisch generierten Zusammenfassungen und Vereinfachungen können Informationen enthalten, die nicht der Wahrheit entsprechen, sogenannte "Halluzinationen"

## Projektstruktur

Wir verwenden django (Python) im Backend, die relevanten Dateien sind im *websvc* Ordner. Der Plug-In Code ist in Javascript und kann im Ordner *highlighter-plugin* oder *highlighter-plugin-chrome* gefunden werden.

## Team

SIMBA wurde von Mitglieder*innen des [AI & Society Lab](https://www.hiig.de/research/ai-and-society-lab/) am [Humboldt Institut für Internet und Gesellschaft](https://www.hiig.de/) in Berlin, Deutschland, entwickelt. Hadi Asghari, Christopher Richter und Freya Hewett sind für die technischen Aspekte verantwortlich, Larissa Wunderlich für die visuellen Aspekte, mit allgemeinem Input von Theresa Züger.

Wenn du Fragen, Feedback oder Kommentare hast, kontaktiere uns unter simba -at- hiig.de. Weitere Informationen findest du auf [unserer Website](https://publicinterest.ai/tool/simba).

---

# SIMBA text assistant

## What is SIMBA?

The Simba Text Assistant is a browser plug-in and webpage that produces summaries of German-language text on web pages. It is designed to additionally simplify the summaries, by shortening the sentences and providing explanations for words.

Our models and code are open source. It has been designed for German-language text, but it may work on other languages.

The target groups of simplified language range from people with cognitive disabilities, to non-native speakers, to children, to non-experts. The ‘societal purpose’ of simplified language therefore encompasses allowing as many different people as possible access to the same information.

## How does SIMBA work?

There are different ways of automatically creating a summarisation, SIMBA is based on a so-called “text generation” model. These text generation models are also referred to as Large Language Models or foundation models: ChatGPT and Llama are examples of these. They are very large neural networks that are fed with a large amount of text data. These networks are trained to calculate what word is most likely to come next in a sequence.
We used German-language newspaper articles that have been simplified to fine-tune the foundation model Llama-3-8B-Instruct. We use articles from the Austrian Press Agency, which have been simplified by professional translators. They are simplified to the levels B1 and A2 on the Common European Framework of Reference for Languages (CEFR). A sample of the dataset can be found [here](https://github.com/fhewett/apa-rst/tree/main/original_texts).

## Known limitations

- It has been created for German-language text: it may work on other languages, but it has not been designed to do so
- The summary may contain false information or ungrammatical phrases

## Project structure

We use django (Python) on the backend, these files are in the *websvc* folder. The plug-in code is in Javascript and can be found in the folder *highlighter-plugin*.

## Credits

SIMBA has been created by members of the [AI & Society Lab](https://www.hiig.de/en/research/ai-and-society-lab/) at the [Humboldt Institute for Internet and Society](https://www.hiig.de/en/) in Berlin, Germany.
Hadi Asghari, Christopher Richter and Freya Hewett are responsible for the technical aspects, Larissa Wunderlich for the visuals, with general input from Theresa Züger.

If you have any questions, feedback or comments, get in touch with us at simba -at- hiig.de. More information can be found [on our website](https://publicinterest.ai/tool/simba).
