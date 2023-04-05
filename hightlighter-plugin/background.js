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
    sendRequest(inputText, "https://hadi.uber.space/api/sum-dum")


    let gettingItem = browser.storage.local.get('model');
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
    })

}

function sendRequest(inputText, model) {
    let ajax = new XMLHttpRequest();
    // We want to post the inputText and listen for the response
    ajax.open('POST', model, true);
    ajax.setRequestHeader('Content-Type', 'application/json');

    ajax.onload = function () {
        if (this.status == 200) {
            // The retrieved data is in JSON format, so we first have to parse it
            let data = JSON.parse(this.response)
            if (data.length > 0) {
                // Sent the retrieved sentences to the contentScript for the highlighting
                portFromCS.postMessage({ greeting: "highlight", sentences: data })
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
            const text = JSON.stringify(m.text)
            callServer(text)
        }
    });
}

// Starts when the connection with the contentScript is made
browser.runtime.onConnect.addListener(connected);