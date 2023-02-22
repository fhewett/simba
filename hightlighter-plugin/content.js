"use strict";

function extractCoreText() {
  let cloneDoc = document.cloneNode(true)
  const reader = new Readability(cloneDoc)
  const article = reader.parse()
  return DOMPurify.sanitize(article.textContent)
}

function replaceText(node, highlightText) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    let content = node.innerHTML;
    //console.log(content)
    const searchWord = "Geschichte"
    const reg = new RegExp(searchWord, "gi")
    content = content.replace(reg, "<mark>$&</mark>");
    node.innerHTML = content;
  }
  /*if (node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i], highlightText);
    }
  }*/
}

// Start the recursion from the body tag.



const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {

      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        replaceText(newNode);
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});

/*browser.runtime.onMessage.addListener((request) => {
  console.log("Message from the background script:");
  console.log(request.action);
  if (request.action === "highlight") {
    console.log(request.sentences)
    replaceText(document.body, request.sentences[0])
  }
  else if (request.action === "getText") {
    return Promise.resolve({ response: extractCoreText() });
  }
});*/

let myPort = browser.runtime.connect({name:"port-from-cs"});

myPort.onMessage.addListener((m) => {
  console.log(m.greeting)
  if (m.greeting == "getText") {
    myPort.postMessage({greeting: "returnText", text: extractCoreText()})
  }
  else if (m.greeting === "highlight") {
    console.log(m.sentences)
    replaceText(document.body, sentences)
  }
});

document.body.addEventListener("click", () => {
  myPort.postMessage({greeting: "they clicked the page!"});
});