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
    console.log("Calling server")

    let getHighlight = chrome.storage.local.get('highlight', function (result) {
        if (result.highlight) sendRequest(inputText, "sum-extract")
    });
    let getSummary = chrome.storage.local.get('summary', function (result) {
        if (result.summary) sendRequest(inputText, "sum-abstract")
    });

}

async function sendRequest(inputText, model) {
    const base_url = "https://simba.publicinterest.ai/simba/api/";

    try {
        const response = await fetch(base_url + model, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputText),
        });

        if (response.ok) {
            const data = await response.json();

            if (Object.keys(data).length > 0) {
                if (model === "sum-extract") {
                    portFromCS.postMessage({ greeting: "highlight", data: data });
                    chrome.runtime.sendMessage({ greeting: "highlight" });
                }

                if (model === "sum-abstract") {
                    portFromCS.postMessage({ greeting: "summary" });
                    chrome.runtime.sendMessage({ greeting: "summary", text: data.output});
                }
            }
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

chrome.contextMenus.create(
    {
      id: "highlight-sel",
      title: "Highlight here!",
      contexts: ["selection"],
    }
  );

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
      case "highlight-sel":
        console.log(info.selectionText);
        chrome.runtime.sendMessage({ greeting: "highSel", text: info.selectionText })
        break;
    }
  });

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
            callServer(JSON.stringify(data));
        }
    });
}

function handleMessage(request, sender, sendResponse) {
    if (request.greeting == "upvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "up" }
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "downvote") {
        const data = { "uuid": window.sessionStorage.getItem("uuid-sum"), "thumb": "down" , "fnotes": request.text}
        sendRequest(JSON.stringify(data), "feedback")
    }
    else if (request.greeting == "returnText") {
        let getBid = chrome.storage.local.get('bid', function (result) {
            console.log(result.bid);
            let data = { "text": request.text, "url": request.url, "bid": result.bid };
            callServer(JSON.stringify(data));
        });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);

// Starts when the connection with the contentScript is made
chrome.runtime.onConnect.addListener(connected);