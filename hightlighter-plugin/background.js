"use strict";

// For debugging purposes
function onError(error) {
    console.error(`Error: ${error}`);
}

/**
 * 
 * @param {string} inputText 
 * 
 * Given any text, this function calls the webservice-api to retrieve the sentences which should be highlighted.
 * For that matter it sends the inputText to ths API
 */
function callServer(inputText) {

    // Temporary dummy
    //sendRequest(inputText, "https://hadi.uber.space/api/sum-dum")
    console.log("Calling server")

    let getHighlight = browser.storage.local.get('highlight');
    getHighlight.then((res) => {
        if (res.highlight) sendRequest(inputText, "sum-extract")
    });
    let getSummary = browser.storage.local.get('summary');
    getSummary.then((res) => {
        if (res.summary) sendRequest(inputText, "sum-abstract")
    });
    /*let gettingItem = browser.storage.local.get('model');
    gettingItem.then((value) => {
        console.log(value.model)
        switch (value.model) {
            case "model1":
                console.log("First Model Loaded")
                //The real model
                sendRequest(inputText, "http://10.0.2.233:8000/sum-wse")
                break;
            case "model2":
                // Dummy on the server
                console.log("Second Model Loaded")
                sendRequest(inputText, "http://10.0.2.233:8000/sum-dum")
                break;
            case "model3":
                // Dummy on Hadis Server
                console.log("Third Model Loaded")
                sendRequest(inputText, "https://hadi.uber.space/api/sum-dum")
                break;
        }
    })*/

}

function sendRequest(inputText, model) {
    const base_url = "https://simba.publicinterest.ai/simba/api/"
    let ajax = new XMLHttpRequest();
    // We want to post the inputText and listen for the response
    ajax.open('POST', base_url + model, true);
    ajax.setRequestHeader('Content-Type', 'application/json');

    ajax.onload = function () {
        if (this.status == 200) {
            // The retrieved data is in JSON format, so we first have to parse it
            let data = JSON.parse(this.response)
            if (Object.keys(data).length > 0) {
                if (model === "sum-extract") portFromCS.postMessage({ greeting: "highlight", data: data })

                if (model === "sum-abstract") {
                    window.sessionStorage.setItem("sum-text", data.output)
                    window.sessionStorage.setItem("uuid-sum", data.uuid)
                    console.log(window.sessionStorage.getItem("uuid-sum"))
                    browser.runtime.sendMessage({ greeting: "summary", text: data.output })
                }
            }
        }
    }
    ajax.send(inputText)
}

// To be able to communicate with the contentScript we create a messager, which sends and retrieves messages to and from the contentScript
let portFromCS;

// Initialize the messager
function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener((m) => {
        console.log(m.greeting)
        // if the contentScript sends the requested text, we send it to the API
        if (m.greeting === "returnText") {
            // Make sure to match the JSON format
            const text = JSON.stringify("Eine Kaltfront hat dem Sommer ein jähes Ende gesetzt. Am Wochenende ist die Schneefallgrenze auf 1000 Meter gesunken. Das hat den Bergregionen viel Neuschnee beschert. Bei den Bergbahnen freut man sich nur teilweise darüber. 'Schönes Herbstwetter wäre uns an diesem Wochenende lieber gewesen', sagt Sepp Odermatt, Direktor Seilbahnen Schweiz. Der Schnee habe die Wanderer vertrieben. Denn in vielen Bergregionen mussten die Wanderrouten aus Sicherheitsgründen gesperrt werden. Langfristig gesehen, habe der Schnee aber auch eine positive Auswirkung auf den Wintersport: 'Der erste Schnee erinnert die Leute an die Winterferien, und das regt zum Kauf von Saisonkarten an', erklärt Odermatt. Der Verkauf beginnt am 1. Oktober. Roger Friedli, Präsident der Berner Bergbahnen zeigt sich erfreut über den Schnee: 'Der Schnee regt die Leute sicherlich zum Kauf von Saisontickets an'. Den Betrieb der Bergbahnen beeinflusse der frühe Wintereinbruch aber nicht. Laut Friedli sei davon auszugehen, dass der Schnee in einer Woche wieder geschmolzen ist. Für die Öffnungen der Bergbahnen sei das Wetter im November ausschlaggebend. 'Dann muss es kalt sein, damit die Pisten beschneit werden können', sagt Friedli. Ein früherer Saisonbeginn will Friedli aber nicht ausschliessen: 'Bleibt es kühl und fällt immer wieder Schnee, könnte es sein, dass einzelne Bahnen bereits Mitte November öffnen können'. Trotz Corona sind die Schweizer Bergbahnen zuversichtlich, dass die Schweizer Skiferien machen werden. Bereits jetzt steht in einigen Regionen fest: Müssen Bahnen wegen Corona an einzelnen Tagen schliessen, erhalten die Kunden mit einer Saisonkarte das Geld für diese Tage zurück. Wie das Schutzkonzept in den Skigebieten genau aussehen wird, will der Verband Seilbahnen Schweiz Anfang Oktober bekannt geben. Anschliessend soll eine gross angelegten Kampagne darauf aufmerksam machen.")
            let data = { "text": m.text, "url": m.url }
            callServer(JSON.stringify(data))
        }
    });
}

function handleMessage(request, sender, sendResponse) {
    console.log(`content script sent a message: ${request.content}`);
    return Promise.resolve({ response:  window.sessionStorage.getItem("uuid-sum")});
}

browser.runtime.onMessage.addListener(handleMessage);

// Starts when the connection with the contentScript is made
browser.runtime.onConnect.addListener(connected);