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
 * 
 * @param {Node} node 
 * @param {string} searchString 
 * @returns {Node} Smallest Parent in which the given String is still fully contained
 * 
 * Given a Root Node to search in, this function will return the smallest Node in which we can still find the entire given searchString
 * The goal of this is to reduce computation time, because we don't need to look for our searchString in Nodes, which do not contain the searchString.
 */
function findSmallestParent(node, searchString) {
  //Only Element Nodes are important, these includes <p>, <div>, <span>, <b>, etc; basically every Node that can contain text
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.innerText != null) {
      let nodeText = node.innerText.replace(/\s/g,' ')
      searchString = searchString.replace(/\s/g,' ')
      //continue the search, if the string is still included
      if (nodeText.includes(searchString)) {
        //search in every Child Node of the current Node
        for (const subNode of node.childNodes) {
          //search recursively
          const ret = findSmallestParent(subNode, searchString)
          if (ret != null) {
            return ret
          }
        }
      }
      else {
        return null
      }
      return node
    }
    return null
  }
  return null
}

/**
 * 
 * @param {{node: Node, text: string, replaceType: int}} replacePropertiesArray 
 * Given an Array of replaceProperties, this function highlights all the given text in their respective Nodes
 * For security reasons any inserted text gets sanatized by DOMPurfy first, this is best practice and even nessasary according to Mozilla
 */
function highlightNode(replacePropertiesArray) {
  for (const replaceProperties of replacePropertiesArray) {
    console.log(replaceProperties)
    let template
    // we create a switch depending on the replaceType
    // the replaceType determines, what parts of the Node we want to highlight, since we do not always want to highlight the entire Node
    switch (replaceProperties.replaceType) {
      // replaceType 0 represents to case, when the entire text is in the Node
      case 0:
        template = document.createElement("template")
        template.innerHTML = DOMPurify.sanitize(replaceProperties.node.nodeValue.replaceAll(replaceProperties.text, "<mark>" + replaceProperties.text + "</mark>"))
        replaceProperties.node.replaceWith(...template.content.childNodes)
        break;
      // replaceType 2 represents the case, when a part of the searchString continues after this Node
      case 2:
        const index = replaceProperties.node.nodeValue.lastIndexOf(replaceProperties.text)
        if (index >= 0) {
          template = document.createElement("template")
          template.innerHTML = DOMPurify.sanitize(replaceProperties.node.nodeValue.substring(0, index) + "<mark>" + replaceProperties.text + "</mark>"
            + replaceProperties.node.nodeValue.substring(index + replaceProperties.text.length))
          replaceProperties.node.replaceWith(...template.content.childNodes)
        }
        break;
      // replaceType 3 represents the case, when before and after this Node, a part of the searchString is matched
      case 3:
      // replaceType 1 represents the case, when a part of the searchString is in front of this Node
      case 1:
        template = document.createElement("template")
        template.innerHTML = DOMPurify.sanitize(replaceProperties.node.nodeValue.replace(replaceProperties.text, "<mark>" + replaceProperties.text + "</mark>"))
        replaceProperties.node.replaceWith(...template.content.childNodes)
        break;
    }

  }
}

/**
 * 
 * @param {Node} currentNode 
 * @param {{nsi: int, ssi: int, sso: int, searchString: int, replacePropertiesArray: replaceProperties}} searchProps 
 * Given a Node and searchProps, this function looks for all the Nodes, in which we can find parts of the searchString.
 * Basically, it fills an Array, which includes all the Text Nodes, which have a consecutive part of the searchString in them.
 * This is important, because we have to respect the HTML hierarchy of the DOM.
 * Each Node, that has a part of the searchString in it has to be highlighted seperately, which is why we first find out which Nodes we need.
 * 
 * nsi: Node Start Index -> Describes, where in the innerText of the smallestParent the currentNode starts
 * ssi: Search Start Index -> Describes, where in the innerText of the smallestParent we started our search
 * sso: Search String Offset -> Describes, which Character of the searchString we are looking at
 * searchString -> the entire text, which we are trying to find
 * replacePropertiesArray -> An Array of the replaceProperties Class
 */
function getReplaceNodes(currentNode, searchProps) {
  switch (currentNode.nodeType) {
    // If the currentNode is an Element, we want to start the recursion until we find the inner textNode
    case Node.ELEMENT_NODE:
      // We want to avoid Style Types, because they do not matter for us
      if (currentNode.nodeName === "STYLE") {
        return null
      }
      // First we save the NodeStartIndex of the currentNode to later compare it, since we override the searchProps in our recursion
      const savedNsi = searchProps.nsi
      // Continue as long as we are not at the end of the searchString
      while (searchProps.sso < searchProps.searchString.length) {
        // If True, the search will be restarted with all childNodes instead of continueing with the parentNode
        let restartSearch = false
        for (const node of currentNode.childNodes) {
          // Start the recursion with this childNode
          switch (getReplaceNodes(node, searchProps)) {
            // True represents, that we've found the entire searchString, so we carry that information upwards in the recursion
            case true:
              return true
            // False represents, that we've found a Character, that is wrong
            case false:
              // Check if we are in a wrong Node
              if (searchProps.ssi < savedNsi || savedNsi + currentNode.innerText.length < searchProps.ssi) {
                return false
              }
              restartSearch = true
              break;
            default:
              continue;
          }
          // We reset nsi, since we've arrived at this point already
          searchProps.nsi = savedNsi
          break;
        }
        if (!restartSearch) {
          return null
        }
      }
      return false

    // If currentNode is a textNode, we can start looking for the Characters of the searchString
    case Node.TEXT_NODE:
      const nodeText = currentNode.nodeValue.replace(/\s/g,' ')
      // This describes, if we've already had a match in an earlier Node, this is only important later for the Highlighting
      const hasMatchBeforeNode = searchProps.ssi > 0 ? 1 : 0
      let matchedText = ""
      // We create a counting variable, which should start at 0 in the beginning
      let i = searchProps.ssi - searchProps.nsi
      // Since we are entering a loop now, which also returns, we have to assign a new nsi here, because we can not do it after the loop
      searchProps.nsi += currentNode.length
      if (i < 0) {
        i = 0
      }
      while (true) {
        // This marks the end of our search for this Node
        // Either we are at the end of the searchString or at the end of our currentNode
        if (searchProps.sso >= searchProps.searchString.length || i >= currentNode.length) {
          if (matchedText.length > 0) {
            // Push the text we found, as well as the Node we found it in and the replaceType to the replacePropertiesArray
            searchProps.rPArray.push({
              node: currentNode, text: matchedText,
              replaceType: hasMatchBeforeNode | (searchProps.sso < searchProps.searchString.length ? 2 : 0)
            })
          }
          // If we found the entire searchString, end the recursion
          if (searchProps.sso >= searchProps.searchString.length) {
            return true
          }
          // If we are at the end of the Node and NOT at the end of the searchString yet, continue the search in the next Node
          if (i >= currentNode.length) {
            return null
          }
        }
        // We loop over every Character in the currentNode and compare it to the respective Character in the searchString
        // If they match, we continue until the above contitions are met
        if (nodeText[i] === searchProps.searchString[searchProps.sso]) {
          matchedText += currentNode.nodeValue[i]
          i++;
          searchProps.sso++
        }
        // If they don't match however, we have to start over again, with the next Character or Node
        else {
          searchProps.rPArray.length = 0
          searchProps.sso = 0
          searchProps.ssi++
          return false
        }
      }
  }
}

function highlightWord() {
  const fileFetch = chrome.runtime.getURL('dict.json')
  fetch(fileFetch)
  .then(response => response.json())
  .then(data => {
    console.log(data)
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

function showTooltip(event) {
  var tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = event.target.getAttribute('data-tooltip');
  document.body.appendChild(tooltip);
  positionTooltip(event, tooltip);
}

function hideTooltip(event) {
  var tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip);
  }
}

function positionTooltip(event, tooltip) {
  tooltip.style.top = event.clientY + 10 + 'px';
  tooltip.style.left = event.clientX + 10 + 'px';
}

// Connect to the messager, to be able to communicate with the backgroundScript
let myPort = chrome.runtime.connect({ name: "port-from-cs" });
myPort.onMessage.addListener((m) => {
  console.log(m.greeting)
  // If we however get the sentences which should be highlighted, we will do so
  if (m.greeting === "highlightZZ") {
    console.log(m.data.output)
    m.data.output.forEach(sentence => {
      console.log(findSmallestParent(document.body, sentence))
      console.log(sentence)
      // First find the smallest Parent Node
      const hNode = findSmallestParent(document.body, sentence)
      if (hNode != null) {
        const rPArray = []
        // Then fill the replaceProperties Array with all the Nodes, which should be highlighted
        getReplaceNodes(hNode, { nsi: 0, ssi: 0, sso: 0, searchString: sentence, rPArray: rPArray })
        console.log(rPArray)
        // And lastly highlight these Nodes
        highlightNode(rPArray)
      }
      else {
        console.log("Could not find text: " + sentence)
      }

    });
  }
  else if (m.greeting === "summary") {
    window.sessionStorage.setItem("sum-text", m.text)
    window.sessionStorage.setItem("uuid-sum", m.uuid)

  }
  else if (m.greeting === "markWords") {
    highlightWord()
    chrome.runtime.sendMessage({ greeting: "highlight"})
  }
});

// User opened the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.greeting === "start") {
    console.log(extractCoreText());
    chrome.runtime.sendMessage({greeting: "returnText", text: extractCoreText(), url: document.URL});
    // Send message to backgroundScript
  }
});
