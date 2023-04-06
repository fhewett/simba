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
            if (this.response.length > 0) {
                let data = JSON.parse(this.response)
                if (Object.keys(data).length > 0) {
                    if (model === "sum-extract") portFromCS.postMessage({ greeting: "highlight", data: data })

                    if (model === "sum-abstract") {
                        window.sessionStorage.setItem("sum-text", data.output)
                        window.sessionStorage.setItem("uuid-sum", data.uuid)
                        browser.runtime.sendMessage({ greeting: "summary", text: data.output })
                    }
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
            let getBID = browser.storage.local.get('bid');
            getBID.then((res) => {
                let data = { "text": m.text, "url": m.url, "bid": res.bid }
                callServer(JSON.stringify(data))
            });
        }
    });
}

function handleMessage(request, sender, sendResponse) {
    if (request.greeting == "upvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "up" }
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "downvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "down" }
        sendRequest(JSON.stringify(data), "feedback")
    }
}

browser.runtime.onMessage.addListener(handleMessage);

// Starts when the connection with the contentScript is made
browser.runtime.onConnect.addListener(connected);