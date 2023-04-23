try {
    let copyButton = document.getElementById("copy")

    copyButton.addEventListener("click", function () {
        navigator.clipboard.writeText(document.getElementById("summary-text").innerText)
    })

} catch (error) {

}

let upvote = document.getElementById("upvote")
upvote.addEventListener("click", sendUpvote)

let downvote = document.getElementById("downvote")
downvote.addEventListener("click", sendDownvote)

function startSimba() {
    let getBID = browser.storage.local.get('bid');
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
    browser.runtime.sendMessage({ greeting: "downvote" })
}

browser.runtime.onMessage.addListener(respondToCall)

function respondToCall(message) {
    console.log(message.greeting)
    if (message.greeting == "summary") {
        for (let element of document.getElementsByClassName("loader2")) element.style.visibility = "hidden"
        console.log(message.text)
        document.getElementById("summary-text").innerText = message.text
    }
    else if (message.greeting == "highlight") {
        for (let element of document.getElementsByClassName("loader")) element.style.visibility = "hidden"
    }
}

window.silex = window.silex || {}
window.silex.data = { "site": { "width": 550 }, "pages": [{ "id": "page-simba-main", "displayName": "Simba Main", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-main" }, "canDelete": true, "canProperties": true, "canMove": true, "canRename": true, "opened": false }, { "id": "page-simba-summary", "displayName": "Simba summary", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-summary" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-about", "displayName": "Simba About", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-about" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-downvote", "displayName": "Simba Feedback downvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-downvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-upvote", "displayName": "Simba Feedback upvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-upvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }] }

document.addEventListener('DOMContentLoaded', startSimba);