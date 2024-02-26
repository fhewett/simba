"use strict";

// For debugging purposes
function onError(error) {
    console.error(`Error: ${error}`);
}

/**
 * Looking for the user's settings depending on whether the user wants to see the summary or the highlighted words
 * 
 * @param {string} inputText The text, which is being sent to the API
 */
function checkToggles(inputText) {

    let getHighlight = browser.storage.local.get('highlight');
    getHighlight.then((res) => {
        // If the user set the Highlight toggle to true, we tell the content script to highlight the words
        if (res.highlight) portFromCS.postMessage({ greeting: "markWords" })
    });
    let getSummary = browser.storage.local.get('summary');
    getSummary.then((res) => {
        // If the user set the Summary toggle to true, we send the text to the API
        if (res.summary) sendRequest(inputText)
    });

}

/**
 * Sending a request to the API
 * This is used for sending the text to the API and retrieving the summary
 * Also used for sending the feedback
 * @param {*} inputText The text, which is being sent to the API
 */
function sendRequest(inputText) {
    const url = "https://simba.publicinterest.ai/simba/api/sum-abstract"
    let ajax = new XMLHttpRequest();
    // We want to post the inputText and listen for the response
    ajax.open('POST', url, true);
    ajax.setRequestHeader('Content-Type', 'application/json');

    ajax.onload = function () {
        if (this.status == 200) {
            // The retrieved data is in JSON format, so we first have to parse it
            if (this.response.length > 0) {
                let data = JSON.parse(this.response)
                if (Object.keys(data).length > 0) {
                    // When the data is retrieved, we store it in the sessionStorage and send it to the contentScript
                    // This way we can use the data later, if the user wants to give feedback
                    window.sessionStorage.setItem("sum-text", data.output)
                    window.sessionStorage.setItem("uuid-sum", data.uuid)
                    browser.runtime.sendMessage({ greeting: "summary", text: data.output })
                }
            }

        }
    }
    ajax.send(inputText)
}

// To be able to communicate with the contentScript we create a messager, which sends and retrieves messages to and from the contentScript
let portFromCS;

/**
 * Continuously listens for messages from the contentScript
 * @param {*} p 
 */
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
                checkToggles(JSON.stringify(data))
            });
        }
    });
}


/**
 * Handles the messages from the popup script
 * Specifically the upvote and downvote messages
 * @param {*} request 
 * @param {*} sender 
 * @param {*} sendResponse 
 */
function handleMessage(request, sender, sendResponse) {
    if (request.greeting == "upvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "up" }
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "downvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "down", "fnotes": request.text }
        sendRequest(JSON.stringify(data), "feedback")
    }
}


// Listen for messages from the Pupup Script
browser.runtime.onMessage.addListener(handleMessage);

// Starts when the connection with the contentScript is made
browser.runtime.onConnect.addListener(connected);