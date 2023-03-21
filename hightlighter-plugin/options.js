function saveOptions(e) {
    const form = document.querySelector("form");
    const data = new FormData(form);
    let output = "";
    for (const entry of data) {
        output = entry[1];
    }
    browser.storage.local.set({
        model: output
    });
    e.preventDefault();
}

function restoreOptions() {    
    try {
        let gettingItem = browser.storage.local.get('model');
        gettingItem.then((res) => {
            const radiobuttons = document.querySelectorAll('input[name="model"]')
            for (const radiobutton of radiobuttons)
                if (radiobutton.value === res.model) {
                    radiobutton.checked = true
                    break;
                }
        });
    } catch (error) {
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);