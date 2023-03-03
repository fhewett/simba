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
    let ajax = new XMLHttpRequest();
    // We want to post the inputText and listen for the response
    ajax.open('POST', "https://hadi.uber.space/api/sum-dum", true);
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

// We create an onclickListerner, which listens for the user to click the toolbar button
browser.browserAction.onClicked.addListener(() => {
    // If the button is pressed, we want to get the core text from the website
    portFromCS.postMessage({ greeting: "getText" });
});