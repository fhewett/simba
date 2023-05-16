let toggleHighlight = document.getElementById("highlight")
let toggleSummary = document.getElementById("summary")

toggleHighlight.addEventListener("change", saveOptions)
    
toggleHighlight.addEventListener("change", function () {
    toggleVisibility(this, "highlightLoader")
})

toggleSummary.addEventListener("change", function () {
    toggleVisibility(this, "summary")
})

toggleSummary.addEventListener("change", saveOptions)

function toggleVisibility(toggleButton, classname) {
    if (toggleButton.checked) {
        for (let element of document.getElementsByClassName(classname)) element.style.visibility = "visible"
    }
    else {
        for (let element of document.getElementsByClassName(classname)) element.style.visibility = "hidden"
    }
}

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
            toggleVisibility(toggleSummary, "summary")
        });
    } catch (error) {
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

