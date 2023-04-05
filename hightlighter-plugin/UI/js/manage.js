let toggleHighlight = document.getElementById("highlight")
let toggleSummary = document.getElementById("summary")

toggleHighlight.addEventListener("change", saveOptions)
    
toggleHighlight.addEventListener("change", function () {
    if (this.checked) {
        
    }
    else {
        browser.tabs.query({ active: true, currentWindow: true })
        .then(removeHighlight)
    }
})

toggleSummary.addEventListener("change", function () {
    if (this.checked) {
        for (let element of document.getElementsByClassName("summary")) element.style.visibility = "visible"
    }
    else {
        for (let element of document.getElementsByClassName("summary")) element.style.visibility = "hidden"
    }
})

toggleSummary.addEventListener("change", saveOptions)

function saveOptions(e) {
    browser.storage.local.set({
        highlight: toggleHighlight.checked,
        summary: toggleSummary.checked
    });
    e.preventDefault();
}

function restoreOptions() {
    try {
        let getHighlight = browser.storage.local.get('highlight');
        getHighlight.then((res) => {
            toggleHighlight.checked = res.highlight
        });
        let getSummary = browser.storage.local.get('summary');
        getSummary.then((res) => {
            toggleSummary.checked = res.summary
        });
    } catch (error) {
        console.log(error)
    }
}


window.silex = window.silex || {}
window.silex.data = { "site": { "width": 550 }, "pages": [{ "id": "page-simba-main", "displayName": "Simba Main", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-main" }, "canDelete": true, "canProperties": true, "canMove": true, "canRename": true, "opened": false }, { "id": "page-simba-summary", "displayName": "Simba summary", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-summary" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-about", "displayName": "Simba About", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-about" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-downvote", "displayName": "Simba Feedback downvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-downvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }, { "id": "page-simba-feedback-upvote", "displayName": "Simba Feedback upvote", "link": { "linkType": "LinkTypePage", "href": "#!page-simba-feedback-upvote" }, "canDelete": true, "canRename": true, "canMove": true, "canProperties": true }] }

document.addEventListener('DOMContentLoaded', restoreOptions);

