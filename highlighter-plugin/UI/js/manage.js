let toggleHighlight = document.getElementById("highlight")
let toggleSummary = document.getElementById("summary")

toggleHighlight.addEventListener("change", saveOptions)

toggleHighlight.addEventListener("change", function () { toggleVisibility(this, "highlightLoader") })

toggleHighlight.addEventListener("change", function () { startOnToggleOn(this) })

toggleSummary.addEventListener("change", function () { toggleVisibility(this, "summary") })

toggleSummary.addEventListener("change", saveOptions)

toggleSummary.addEventListener("change", function () { startOnToggleOn(this) })

// If the toggle is on, we start the Simba
function startOnToggleOn(toggleButton) {
    if (toggleButton.checked) {
        startSimba()
    }
}

// If the user disables the summary option, we hide it entirely until the user enables it again
function toggleVisibility(toggleButton, classname) {
    if (toggleButton.checked) {
        for (let element of document.getElementsByClassName(classname)) element.style.visibility = "visible"
    }
    else {
        for (let element of document.getElementsByClassName(classname)) element.style.visibility = "hidden"
    }
}

// Store the options in the local storage
// This way the options are saved, even if the user closes the browser
function saveOptions(e) {
    browser.storage.local.set({
        highlight: toggleHighlight.checked,
        summary: toggleSummary.checked
    });
    e.preventDefault();
}

// Restore the options from the local storage
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
            toggleVisibility(toggleHighlight, "highlightLoader")
        });
    } catch (error) {
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

