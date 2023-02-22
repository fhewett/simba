"use strict";

function onError(error) {
    console.error(`Error: ${error}`);
}

function callServer(inputText) {

    console.log(inputText)
    let ajax = new XMLHttpRequest();
    ajax.open('POST', "http://10.0.2.233:8000/sum-dum", true);
    ajax.setRequestHeader('Content-Type', 'application/json'); // I think this is okay

    ajax.onload = function () {
        if (this.status == 200) {
            let data = JSON.parse(this.response)
            if (data.length > 0) {
                portFromCS.postMessage({ greeting: "highlight", sentences: data })
            }
        }
    }

    ajax.send(inputText)
}

/*
function sendMessageToTabs(tabs) {
    for (const tab of tabs) {
        browser.tabs
            .sendMessage(tab.id, { action: "getText" })
            .then((response) => {
                console.log("Message from the content script:");
                callServer(JSON.stringify(response.response))
            })
            .catch(onError);
    }
}

function sendMessageToTabs2(data) {
    browser.tabs
        .sendMessage(tabs[0].id, { action: "highlight", sentences: data })
        .then((response) => {
            console.log("Message from the content script:");

        })
        .catch(onError);
}

browser.browserAction.onClicked.addListener(() => {
    browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then(sendMessageToTabs)
        .catch(onError);
});*/

let portFromCS;

function connected(p) {
    portFromCS = p;
    portFromCS.postMessage({ greeting: "hi there content script!" });
    portFromCS.onMessage.addListener((m) => {
        console.log(m.greeting)
        if (m.greeting === "returnText") {
            const text = JSON.stringify(m.text)
            console.log(text)
            callServer(text)
        }
    });
}

browser.runtime.onConnect.addListener(connected);

browser.browserAction.onClicked.addListener(() => {
    portFromCS.postMessage({ greeting: "getText" });
});