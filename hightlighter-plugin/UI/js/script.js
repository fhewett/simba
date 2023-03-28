let toggleHighlight = document.getElementById("highlight")
let toggleSummary = document.getElementById("summary")

toggleHighlight.addEventListener("change", function() {
    if (this.checked) {
        console.log("CHECKED")
    }
    else {
        console.log("UNCHECKED")
    }
})

toggleSummary.addEventListener("change", function() {
    if (this.checked) {
        location.assign("./simba-summary.html")
    }
    else {
        location.assign("./index.html")
    }
})


window.silex = window.silex || {}
window.silex.data = {"site":{"width":550},"pages":[{"id":"page-simba-main","displayName":"Simba Main","link":{"linkType":"LinkTypePage","href":"#!page-simba-main"},"canDelete":true,"canProperties":true,"canMove":true,"canRename":true,"opened":false},{"id":"page-simba-summary","displayName":"Simba summary","link":{"linkType":"LinkTypePage","href":"#!page-simba-summary"},"canDelete":true,"canRename":true,"canMove":true,"canProperties":true},{"id":"page-simba-about","displayName":"Simba About","link":{"linkType":"LinkTypePage","href":"#!page-simba-about"},"canDelete":true,"canRename":true,"canMove":true,"canProperties":true},{"id":"page-simba-feedback-downvote","displayName":"Simba Feedback downvote","link":{"linkType":"LinkTypePage","href":"#!page-simba-feedback-downvote"},"canDelete":true,"canRename":true,"canMove":true,"canProperties":true},{"id":"page-simba-feedback-upvote","displayName":"Simba Feedback upvote","link":{"linkType":"LinkTypePage","href":"#!page-simba-feedback-upvote"},"canDelete":true,"canRename":true,"canMove":true,"canProperties":true}]}
