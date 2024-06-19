"use strict";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // This action is called everytime the user opens the popup
  if (request.action === "getPageContent") {
    sendResponse({ text: extractCoreText(), url: document.URL }); 
  }
});


// Function to extract the core text of any webpage 
function extractCoreText() {
  let cloneDoc = document.cloneNode(true)
  
  // Remove code elements to make page content cleaner
  if (cloneDoc.querySelector("code") != null) {
    const e = cloneDoc.querySelector("code")
    e.remove()
  }

  // Use readability (external lib by Mozilla) to get the page core content 
  const reader = new Readability(cloneDoc)
  const article = reader.parse()
  let txt = article.title + "\n\n" + article.textContent
  
  // HA: we original used `DOMPurify.sanitize(txt)`, however I don't think the purification/sanitization is necessary?
  return txt
}


