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
function checkToggles(inputText) {
    console.log("Calling server")

    let getHighlight = chrome.storage.local.get('highlight', function (result) {
        if (result.highlight) portFromCS.postMessage({ greeting: "markWords" })
    });
    let getSummary = chrome.storage.local.get('summary', function (result) {
        if (result.summary) sendRequest(inputText)
    });

}

async function sendRequest(inputText) {
    const url = "https://simba.publicinterest.ai/simba/api/sum-abstract";

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: inputText,
        });

        if (response.ok) {
            const data = await response.json();

            if (Object.keys(data).length > 0) {
                portFromCS.postMessage({ greeting: "summary" });
                chrome.runtime.sendMessage({ greeting: "summary", text: data.output });
            }
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

// To be able to communicate with the contentScript we create a messager, which sends and retrieves messages to and from the contentScript
let portFromCS;

// Initialize the messager
function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener(async (m) => {
        console.log(m.greeting)
        // if the contentScript sends the requested text, we send it to the API
        if (m.greeting === "returnText") {
            // Make sure to match the JSON format
            let data = { "text": m.text, "url": m.url, "bid": m.bid };
            print("Data:" + data);
            checkToggles(JSON.stringify(data));
        }
    });
}

function handleMessage(request, sender, sendResponse) {
    if (request.greeting == "upvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "up" }
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "downvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "down", "fnotes": request.text }
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "returnText") {
        let getBid = chrome.storage.local.get('bid', function (result) {
            console.log(result.bid);
            let data = { "text": request.text, "url": request.url, "bid": result.bid };
            checkToggles(JSON.stringify(data));
        });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);

// Starts when the connection with the contentScript is made
chrome.runtime.onConnect.addListener(connected);