try {
    let copyButton = document.getElementById("copy")

    copyButton.addEventListener("click", function () {
        // If the user clicks the copy button, we copy the summary to the clipboard
        navigator.clipboard.writeText(document.getElementById("summary-text").innerText)
    })

} catch (error) {

}

/**
 * Checks the user's language and changes the UI accordingly
 * Can be expanded to support more languages
 * Currently supports German and English
 * English is the default language
 */
function checkUserLanguage() {
    // Check for user's browser language
    const userLanguage = navigator.language || navigator.userLanguage;
    console.log(userLanguage);

    // If the user's language is German, we change the UI to German
    if (userLanguage.startsWith("de")) {

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

    }

}

/**
 * Starts the Simba process
 */
function startSimba() {
    // If the user has already been assigned a bid, we don't need to assign a new one
    // Each user gets a unique browser id to be able to track the user's feedback
    let getBID = browser.storage.local.get('bid');

    // Change the UI according to the user's language
    checkUserLanguage();
    getBID.then((res) => {

        // If the user has not been assigned a bid, we assign a new one
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

let upvote = document.getElementById("upvote")
if (upvote != null) {
    upvote.addEventListener("click", sendUpvote)
}

let downvote = document.getElementById("down-sub")
if (downvote != null) {
    downvote.addEventListener("click", sendDownvote)
}

// Send upvote message to the backgroundScript
// If the user clicks the upvote button
function sendUpvote() {
    browser.runtime.sendMessage({ greeting: "upvote" })
}

// Send downvote message to the backgroundScript
// If the user clicks the downvote button
// Also redirects the user to the upvote page
function sendDownvote() {
    let downvoteText = document.getElementById("down-text").value
    browser.runtime.sendMessage({ greeting: "downvote", text: downvoteText })
    window.location.href = "./simba-feedback-upvote.html";
}

browser.runtime.onMessage.addListener(respondToCall)

/**
 * Responds to the backgroundScript
 * The Loaders will get hidden when the according message is received
 * If the users wants to see the summary, the summary will be displayed
 * @param {*} message Message of the backgroundScript
 */
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

// Start the plugin when the page is loaded
document.addEventListener('DOMContentLoaded', startSimba);