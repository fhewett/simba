function extractCoreText() {
  let cloneDoc = document.cloneNode(true)
  const reader = new Readability(cloneDoc)
  const article = reader.parse()
  return DOMPurify.sanitize(article.textContent)
}

function replaceText (node) {
  if (node.nodeType === Node.ELEMENT_NODE) {

    console.log(node)
    let content = node.innerHTML;
    console.log(content)
    const searchWord = "Geschichte"
    const reg = new RegExp(searchWord, "gi")
    content = content.replace(reg, "<mark>$&</mark>");
    hjdsadhsaj
    node.innerHTML = content;
  }
  else {
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i]);
    }    
  }
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