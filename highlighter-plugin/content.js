"use strict";

/**
 * 
 * @returns The cleaned and sanatized core Text of a website
 * This function just uses external libraries to extract the core text of any website
 */
function extractCoreText() {
  let cloneDoc = document.cloneNode(true)

  // Elements to remove
  if (cloneDoc.querySelector("code") != null) {
    const e = cloneDoc.querySelector("code")
    e.remove()
  }
  // Elements to remove

  const reader = new Readability(cloneDoc)
  const article = reader.parse()
  let txt = ""
  if (article.textContent.includes(article.excerpt)) {
    txt = article.title + "\n\n" + article.textContent
  }
  else {
    txt = article.title + "\n\n" + article.excerpt + "\n\n" + article.textContent
  }
  return DOMPurify.sanitize(txt)
}

/**
 * Highlight words in the text
 * Takes words from the local file dict.json and highlights them in the text
 */
function highlightWords() {
  // Fetch the JSON data
  const fileFetch = browser.runtime.getURL('dict.json')
  fetch(browser.extension.getURL("dict.json"))
    .then(response => response.json())
    .then(data => {
      // Function to recursively traverse the DOM and apply search and replace to text nodes
      function traverseAndHighlight(node) {
        if (node.nodeType === 3) { // Text node
          // Create a temporary document fragment
          var fragment = document.createDocumentFragment();

          // Split the text content by word boundaries
          var words = node.nodeValue.split(/\b/);

          // Process each word
          words.forEach(word => {
            var span = document.createElement('span');
            span.textContent = word;

            // Highlight and add tooltips to words found in the JSON data
            Object.keys(data).forEach(key => {
              var regex = new RegExp('\\b' + key + '\\b', 'gi');
              if (regex.test(word)) {
                span.className = 'highlight';
                span.setAttribute('data-tooltip', data[key]);
              }
            });

            fragment.appendChild(span);
          });

          // Replace the original text node with the fragment
          node.parentNode.replaceChild(fragment, node);
        } else if (node.nodeType === 1) { // Element node
          // Recursively traverse child nodes
          for (var i = 0; i < node.childNodes.length; i++) {
            traverseAndHighlight(node.childNodes[i]);
          }
        }
      }

      // Start traversing from the body of the document
      traverseAndHighlight(document.body);

      // Add event listeners for showing/hiding tooltips
      var highlightedWords = document.querySelectorAll('.highlight');
      highlightedWords.forEach(wordElement => {
        wordElement.addEventListener('mouseenter', showTooltip);
        wordElement.addEventListener('mouseleave', hideTooltip);
      });
    });

}

/**
 * Shows the tooltip when hovering over a highlighted word
 * @param {*} event 
 */
function showTooltip(event) {
  // Create a tooltip element and append it to element of the highlighted word
  var tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = event.target.getAttribute('data-tooltip');
  document.body.appendChild(tooltip);
  positionTooltip(event, tooltip);
}

/**
 * Remove the tooltip when the mouse leaves the highlighted word
 * @param {*} event 
 */
function hideTooltip(event) {
  var tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip);
  }
}

/**
 * Adjusting the postion of the tooltip
 * Can be customized
 * @param {*} event 
 * @param {*} tooltip 
 */
function positionTooltip(event, tooltip) {
  tooltip.style.top = event.clientY + 10 + 'px';
  tooltip.style.left = event.clientX + 10 + 'px';
}

// Connect to the messager, to be able to communicate with the backgroundScript
let myPort = browser.runtime.connect({ name: "port-from-cs" });

myPort.onMessage.addListener((m) => {
  console.log(m.greeting)
  // If the backgroundScript sends the message to highlight the words, we call the function to highlight the words
  if (m.greeting === "markWords") {
    highlightWords()
    // After highlighting send a message to the pupup script to tell it the highlighting is done
    browser.runtime.sendMessage({ greeting: "highlight" })
  }
});

// Listen for messages from the popup script
browser.runtime.onMessage.addListener((message) => {
  // If the message is to start the process, we call the function to extract the core text
  // and send it to the backgroundScript
  if (message.greeting === "start") {
    console.log(extractCoreText())
    myPort.postMessage({ greeting: "returnText", text: extractCoreText(), url: document.URL })
  }
});