try {
    let copyButton = document.getElementById("copy");

    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(document.getElementById("summary-text").innerText);
    });
} catch (error) {
    // Handle the error gracefully
}

try {
    let downvoteSubmit = document.getElementById("down-sub");

    downvoteSubmit.addEventListener("click", function () {
        let downvoteText = document.getElementById("down-text").value;
        chrome.runtime.sendMessage({ greeting: "downvote", text: downvoteText });
    });
} catch (error) {
    // Handle the error gracefully
}

let upvote = document.getElementById("upvote");
upvote.addEventListener("click", sendUpvote);

let downvote = document.getElementById("downvote");
downvote.addEventListener("click", sendDownvote);

async function startSimba() {
    // Get the varialbe "bid" from the chrome local storage
    let bid = await getBid();
    console.log(bid);
    // If the variable is not set, then set it to a random number
    if (bid == undefined) {
        bid = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
        chrome.storage.local.set({ bid: bid });
    }

    // Send a message to the content script to start the highlighting process
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            greeting: "start"
        });
    });

}

async function getBid() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['bid'], function (result) {
            resolve(result.bid);
        });
    });
}

function sendIt(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        greeting: "start"
    });
}

function removeHighlight(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
        greeting: "restore"
    });
}

function sendUpvote() {
    chrome.runtime.sendMessage({ greeting: "upvote" });
}

function sendDownvote() {
    chrome.runtime.sendMessage({ greeting: "downvote" });
}

chrome.runtime.onMessage.addListener(respondToCall);

function respondToCall(message) {
    console.log(message.greeting);
    if (message.greeting == "summary") {
        for (let element of document.getElementsByClassName("summaryLoader")) element.style.visibility = "hidden";
        document.getElementById("summary-text").innerText = message.text;
    } else if (message.greeting == "highlight") {
        for (let element of document.getElementsByClassName("highlightLoader")) element.style.visibility = "hidden";
    }
}

document.addEventListener('DOMContentLoaded', startSimba);