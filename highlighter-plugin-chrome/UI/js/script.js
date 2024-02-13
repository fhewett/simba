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
if (upvote != null) {
    upvote.addEventListener("click", sendUpvote);
}

let downvote = document.getElementById("down-sub");
if (downvote != null) {
    downvote.addEventListener("click", sendDownvote);
}

function checkUserLanguage() {
    const userLanguage = navigator.language || navigator.userLanguage;
    console.log(userLanguage);

    if (userLanguage.startsWith("de")) {

        console.log(document.getElementsByClassName("summary-sub")[0])

        // Downvote Page
        if (document.getElementById("down-text") != null) document.getElementById("down-text").placeholder = "Bitte erklären Sie uns, warum Sie diesen Text nicht hilfreich fanden.";
        if (document.getElementById("down-sub") != null) document.getElementById("down-sub").innerText = "Absenden";
        if (document.getElementsByClassName("sub-feedback")[0] != null) document.getElementsByClassName("sub-feedback")[0].innerText = "Vielen Dank für Ihr Feedback!";
        if (document.getElementsByClassName("downvote-propose")[0] != null) document.getElementsByClassName("downvote-propose")[0].innerText = "Haben Sie einen Vorschlag, wie wir diesen Text verbessern können?";

        // Index Page
        if (document.getElementsByClassName("highlight-head")[0] != null) document.getElementsByClassName("highlight-head")[0].innerText = "Zeigt Wörterdefinitionen";
        if (document.getElementsByClassName("highlight-sub")[0] != null) document.getElementsByClassName("highlight-sub")[0].innerText = "Bereitgestellt von Hurraki - Einfache Sprache";
        if (document.getElementsByClassName("summary-head")[0] != null) document.getElementsByClassName("summary-head")[0].innerText = "Zusammenfassung";
        if (document.getElementsByClassName("summary-sub")[0] != null) document.getElementsByClassName("summary-sub")[0].innerText = "Von unserem KI-Modell generiert";
        if (document.getElementsByClassName("summary-main")[0] != null) document.getElementsByClassName("summary-main")[0].innerText = "ZUSAMMENFASSUNG";
        if (document.getElementById("summary-text") != null) document.getElementById("summary-text").innerText = "Zusammenfassung wird vorbereitet...";

        // Upvote Page

    }

}

async function startSimba() {
    // Get the varialbe "bid" from the chrome local storage
    let bid = await getBid();
    console.log(bid);
    checkUserLanguage();
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
    downvoteText = document.getElementById("down-text").value;
    chrome.runtime.sendMessage({ greeting: "downvote" });
    window.location.href = "./simba-feedback-upvote.html";
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