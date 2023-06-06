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
        for (let element of document.getElementsByClassName("summaryLoader")) element.style.visibility = "hidden"
        document.getElementById("summary-text").innerText = message.text
    }
    else if (message.greeting == "highlight") {
        for (let element of document.getElementsByClassName("highlightLoader")) element.style.visibility = "hidden"
    }
}

document.addEventListener('DOMContentLoaded', startSimba);