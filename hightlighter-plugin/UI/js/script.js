try {
    let copyButton = document.getElementById("copy")
    
    copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(document.getElementById("summary-text").innerText)
    })
       
} catch (error) {
    
}

let upvote = document.getElementById("upvote")
upvote.addEventListener("click", function() {
    const sending = browser.runtime.sendMessage({content: "Test"})
    sending.then(console.log(this.response))
})

function startSimba() {
    browser.tabs.query({ active: true, currentWindow: true })
        .then(sendIt)
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

browser.runtime.onMessage.addListener(showSummary)

function showSummary(message) {
    console.log(message.greeting)
    if (message.greeting = "summary") {
        document.getElementById("summary-text").innerText = message.text
    }
}

window.silex = window.silex || {}
window.silex.data = { "site": { "width": 550 }, "pages": [{ "id": "page-simba-main", "displayName": "Simba Main", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-main" }, "canDelete": true, "canProperties": true, "canMove": true, "canRename": true, "opened": false }, { "id": "page-simba-summary", "displayName": "Simba summary", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-summary" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-about", "displayName": "Simba About", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-about" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-downvote", "displayName": "Simba Feedback downvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-downvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-upvote", "displayName": "Simba Feedback upvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-upvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }] }

document.addEventListener('DOMContentLoaded', startSimba);