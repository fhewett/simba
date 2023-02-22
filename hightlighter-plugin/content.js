"use strict";

function extractCoreText() {
  console.log("Hello")
  let cloneDoc = document.cloneNode(true)
  const reader = new Readability(cloneDoc)
  const article = reader.parse()
  return DOMPurify.sanitize(article.textContent)
}

/*var ajax = new XMLHttpRequest();
ajax.open('POST', URLHERE, true);
ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); // I think this is okay

ajax.onload = function() {
	if (this.status == 200) {
		var data = JSON.parse(this.response);
		if (data.length > 0) {
			replaceText(document.body, data)
		}
	}
}

ajax.send(extractCoreText());*/

function replaceText(node, highlightText) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    let content = node.innerHTML;
    console.log(content)
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
replaceText(document.body);


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

browser.runtime.onMessage.addListener((request) => {
  console.log("Message from the background script:");
  console.log(request.action);
  console.log(extractCoreText())
  return Promise.resolve({ response: "Hi from content script" });
});
