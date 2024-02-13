try {
    let copyButton = document.getElementById("copy")

    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(document.getElementById("summary-text").innerText)
    })

} catch (error) {

}

try {
    let downvoteSubmit = document.getElementById("down-sub")

    downvoteSubmit.addEventListener("click", function () {
        let downvoteText = document.getElementById("down-text").value
        browser.runtime.sendMessage({ greeting: "downvote" , text: downvoteText})
    })

} catch (error) {

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


let upvote = document.getElementById("upvote")
if (upvote != null) {
    upvote.addEventListener("click", sendUpvote)
}

let downvote = document.getElementById("down-sub")
if (downvote != null) {
    downvote.addEventListener("click", sendDownvote)
}


function startSimba() {
    let getBID = browser.storage.local.get('bid');
    checkUserLanguage();
    getBID.then((res) => {
        if (Object.keys(res).length === 0) {
            const bid = Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36)
            console.log(bid)
            browser.storage.local.set({
                bid: bid
            });
        }
        browser.tabs.query({ active: true, currentWindow: true })
            .then(sendIt)
    });
}

function sendIt(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        greeting: "start"
    })
}

function removeHighlight(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        greeting: "restore"
    })
}

function sendUpvote() {
    browser.runtime.sendMessage({ greeting: "upvote" })
}

function sendDownvote() {
    let downvoteText = document.getElementById("down-text").value
    browser.runtime.sendMessage({ greeting: "downvote", text: downvoteText })
    window.location.href = "./simba-feedback-upvote.html";
}

browser.runtime.onMessage.addListener(respondToCall)

function respondToCall(message) {
    console.log(message.greeting)
    if (message.greeting == "summary") {
        for (let element of document.getElementsByClassName("summaryLoader")) element.style.visibility = "hidden"
        document.getElementById("summary-text").innerText = message.text
    }
    else if (message.greeting == "highlight") {
        for (let element of document.getElementsByClassName("highlightLoader")) element.style.visibility = "hidden"
    }
}

document.addEventListener('DOMContentLoaded', startSimba);