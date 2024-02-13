# SIMBA Text Assistent

## Was ist der SIMBA Text Assistent?

Der Simba Text Assistent ist ein Browser-Plugin, der Zusammenfassungen von deutschsprachigen Texten auf Webseiten erstellt. Er wurde entwickelt, um die Zusammenfassungen zusätzlich zu vereinfachen, indem er die Sätze verkürzt und Erklärungen zu Wörtern liefert. Wir haben zudem das [Hurraki-Wörterbuch](https://hurraki.de/wiki/Hauptseite) integriert, außerdem kannst du wählen, ob du im Wörterbuch und im Online-Text gefundene Wörter markieren und deren Definition in Leichter Sprache angezeigt bekommen möchtest.

Unsere Modelle und unser Code sind Open Source.

## Wie funktioniert SIMBA?

Es gibt verschiedene Möglichkeiten, eine Zusammenfassung automatisch zu erstellen, Simba basiert auf einem sogenannten "Textgenerierungsmodell". Diese Textgenerierungsmodelle werden auch als Large Language Models oder Foundation Models bezeichnet: ChatGPT und Llama sind Beispiele für diese Modelle. Es handelt sich um sehr große neuronale Netze, die mit einer großen Menge von Textdaten gefüttert werden. Diese Netze werden darauf trainiert, zu berechnen, welches Wort in einer Sequenz am wahrscheinlichsten als nächstes kommt.
Wir haben deutschsprachige Zeitungsartikel verwendet, die zur Fine-Tuning (=Feinabstimmung) des Grundmodells Mistral-7B-v0.1 vereinfacht wurden. Wir verwenden Artikel der Österreichischen Presseagentur, die von professionellen Übersetzern vereinfacht wurden. Sie wurden auf die Niveaus B1 und A2 des Gemeinsamen Europäischen Referenzrahmens für Sprachen (GER) vereinfacht. Ein Beispiel für den Datensatz findet sich [hier](https://github.com/fhewett/apa-rst/tree/main/original_texts). 

## Die Grenzen von SIMBA

- SIMBA funktioniert am besten mit kurzen Input-Texten
- SIMBA ist für deutschsprachige Texte optimiert
- Die automatisch generierten Zusammenfassungen und Vereinfachungen können Informationen enthalten, die nicht der Wahrheit entsprechen, sogenannte "Halluzinationen"

## Projektstruktur

Wir verwenden django (Python) im Backend, die relevanten Dateien sind im *websvc* Ordner. Der Plug-In Code ist in Javascript und kann im Ordner *highlighter-plugin* oder *highlighter-plugin-chrome* gefunden werden.

## Team

SIMBA wurde von Mitgliedern des [AI & Society Lab](https://www.hiig.de/research/ai-and-society-lab/) am [Humboldt Institut für Internet und Gesellschaft](https://www.hiig.de/) in Berlin, Deutschland, entwickelt. Hadi Asghari, Christopher Richter und Freya Hewett sind für die technischen Aspekte verantwortlich, Larissa Wunderlich für die visuellen Aspekte, mit allgemeinem Input von Theresa Züger.

Wenn du Fragen, Feedback oder Kommentare hast, kontaktiere uns unter simba -at- hiig.de. Weitere Informationen findest du [unserer Website](https://publicinterest.ai/tool/simba). 
