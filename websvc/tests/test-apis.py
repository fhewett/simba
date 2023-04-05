import requests
from django.test import LiveServerTestCase

class MyLiveServerTests(LiveServerTestCase):

    def test_api_extract(self):
        # Replace the URL with the endpoint of the server you want to test
        url = self.live_server_url + '/simba/api/sum-extract'

        # Define the data you want to send in the AJAX call
        data = {
            'text': "Eine Kaltfront hat dem Sommer ein jähes Ende gesetzt. Am Wochenende ist die Schneefallgrenze auf 1000 Meter gesunken. Das hat den Bergregionen viel Neuschnee beschert. Bei den Bergbahnen freut man sich nur teilweise darüber. 'Schönes Herbstwetter wäre uns an diesem Wochenende lieber gewesen', sagt Sepp Odermatt, Direktor Seilbahnen Schweiz. Der Schnee habe die Wanderer vertrieben. Denn in vielen Bergregionen mussten die Wanderrouten aus Sicherheitsgründen gesperrt werden. Langfristig gesehen, habe der Schnee aber auch eine positive Auswirkung auf den Wintersport: 'Der erste Schnee erinnert die Leute an die Winterferien, und das regt zum Kauf von Saisonkarten an', erklärt Odermatt. Der Verkauf beginnt am 1. Oktober. Roger Friedli, Präsident der Berner Bergbahnen zeigt sich erfreut über den Schnee: 'Der Schnee regt die Leute sicherlich zum Kauf von Saisontickets an'. Den Betrieb der Bergbahnen beeinflusse der frühe Wintereinbruch aber nicht. Laut Friedli sei davon auszugehen, dass der Schnee in einer Woche wieder geschmolzen ist. Für die Öffnungen der Bergbahnen sei das Wetter im November ausschlaggebend. 'Dann muss es kalt sein, damit die Pisten beschneit werden können', sagt Friedli. Ein früherer Saisonbeginn will Friedli aber nicht ausschliessen: 'Bleibt es kühl und fällt immer wieder Schnee, könnte es sein, dass einzelne Bahnen bereits Mitte November öffnen können'. Trotz Corona sind die Schweizer Bergbahnen zuversichtlich, dass die Schweizer Skiferien machen werden. Bereits jetzt steht in einigen Regionen fest: Müssen Bahnen wegen Corona an einzelnen Tagen schliessen, erhalten die Kunden mit einer Saisonkarte das Geld für diese Tage zurück. Wie das Schutzkonzept in den Skigebieten genau aussehen wird, will der Verband Seilbahnen Schweiz Anfang Oktober bekannt geben. Anschliessend soll eine gross angelegten Kampagne darauf aufmerksam machen.",
        }

        response = requests.post(url, data=data)

        # Check that the server responded with a success status code
        assert response.status_code == 200

        # Check that the server responded with the expected content
        assert set(response.json().keys()) == {'output', 'uuid'}
        assert type(response.json()['output']) is list
        assert type(response.json()['output'][0]) is str
