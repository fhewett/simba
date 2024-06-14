"use strict";

let summaryUUID = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DBG: popup.js DOMContentLoaded event fired!');   
  document.getElementById('message-box').innerText = 'Getting page content...';
      
  // let's send a message to content.js to get the active page's content
  function fetchContent(retryCount = 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;      
      chrome.tabs.sendMessage(tabId, { action: "getPageContent" }, (response) => {
        if (response) {
          // lastly: we send this content to the Simba server to produce simplified summary 
          document.getElementById('message-box').innerText = "Waiting for Simba server...";
          callSimbaSimplifyApi(response.text, response.url);  
        } else if (retryCount < 4) {
          // sometimes the getpagecontent can be slow, so retrying is needed
          // (note, this should be abandoned if the popup is already closed.) 
          console.error('popup.js: Failed to get content, retrying...');
          setTimeout(() => fetchContent(retryCount + 1), 500);
        } else {
          console.error('popup.js: Failed to get content after retries');
          document.getElementById('message-box').innerText = "Cannot get this page's content!";
       	  document.getElementById('progressbar').style.display = "none";  // hide progress bar   
        }
      });
    });
  }

  fetchContent();

  // lastly, lets wire events for the buttons & voting 
  try {
    document.getElementById("copy").addEventListener("click", function () {
	    navigator.clipboard.writeText(document.getElementById("message-box").innerText);
    });
  } catch (error) {}
  try {
    document.getElementById("upvote").addEventListener("click",function () { 
    	if (summaryUUID != null) {
    	   // no summary, no feedback! 
         callSimbaFeedbackApi(summaryUUID, "up");
        document.getElementById("summary-view").style.display = 'none';
        document.getElementById("feedback-view").style.display = 'block';
        document.getElementById("thumbsup").style.display = 'block';        
        document.getElementById("thumbsdown").style.display = 'none';        
    	}
    });   
    document.getElementById("downvote").addEventListener("click", function () { 
    	if (summaryUUID != null) {
        callSimbaFeedbackApi(summaryUUID, "dn");
        document.getElementById("summary-view").style.display = 'none';
        document.getElementById("feedback-view").style.display = 'block';
        document.getElementById("thumbsup").style.display = 'none';        
        document.getElementById("thumbsdown").style.display = 'block';     
        document.getElementById("downexplain-view").style.display = 'block';        
   
    	}
    });
    document.getElementById("down-submit").addEventListener("click",function () { 
      if (summaryUUID != null) {
        var feedback = document.getElementById("down-explain").value;
        callSimbaFeedbackApi(summaryUUID, "dn", feedback);
        document.getElementById("downexplain-view").style.display = 'none';
      }
    });     
    document.getElementById("simba-logo").addEventListener("click",function () { 
      document.getElementById("summary-view").style.display = 'block';
      document.getElementById("feedback-view").style.display = 'none';
    });
   } catch (error) { 
       console.error('popjs: error setting feedback/thumb listners');
   }
});


async function callSimbaSimplifyApi(pagetext, pageurl) {
    const simbaurl = "https://simba.publicinterest.ai/simba/api/sum-abstract";
    try {
        const response = await fetch(simbaurl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ "text": pagetext, "url": pageurl })
        });
        if (response.ok) {
            const data = await response.json();
            summaryUUID = data.uuid;
            console.log('Got Simba simplify API results:', data);
	          document.getElementById('message-box').innerText = data.output; // display server output
	          document.getElementById('progressbar').style.display = "none";  // hide progress bar
        } else {
            console.error('Bad server response for simba simplify api');
            document.getElementById('message-box').innerText = 'Bad response from Simba server: ' + response.status;
        }
    } catch (error) {
        console.error('Error during simba simplify api:', error);
        document.getElementById('message-box').innerText = 'Error connecting to Simba server: ' + error;
    }
}


async function callSimbaFeedbackApi(uuid, thumb, fnotes="") {
    const simbaurl = "https://simba.publicinterest.ai/simba/api/feedback";
    // console.log(JSON.stringify({ "uuid": uuid, "thumb": thumb, "fnotes": fnotes }));
    try {
        const response = await fetch(simbaurl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ "uuid": uuid, "thumb": thumb, "fnotes": fnotes })
        });
        if (response.ok) {
            console.log('Server response ok for Simba feedback API');
        } else {
            console.error('Bad server response for Simba feedback API: ', response.status);
        }
    } catch (error) {
        console.error('Error during Simba feedback API:', error);
    }
}



/* // HA: old method of translating to German; to decide what to do with it
function checkUserLanguage() {
    const userLanguage = navigator.language || navigator.userLanguage;
    console.log(userLanguage);
    if (userLanguage.startsWith("de")) {
        console.log(document.getElementsByClassName("summary-sub")[0])
        // Downvote Page
        if (document.getElementById("down-text") != null) document.getElementById("down-text").placeholder = "Bitte erklären Sie uns, warum Sie diesen Text nicht hilfreich fanden.";
        if (document.getElementById("down-sub") != null) document.getElementById("down-sub").innerText = "Absenden";
        if (document.getElementsByClassName("downvote-propose")[0] != null) document.getElementsByClassName("downvote-propose")[0].innerText = "Haben Sie einen Vorschlag, wie wir diesen Text verbessern können?";
        // Index Page
        if (document.getElementsByClassName("highlight-head")[0] != null) document.getElementsByClassName("highlight-head")[0].innerText = "Zeigt Wörterdefinitionen";
        if (document.getElementsByClassName("highlight-sub")[0] != null) document.getElementsByClassName("highlight-sub")[0].innerText = "Bereitgestellt von Hurraki - Einfache Sprache";
        if (document.getElementsByClassName("summary-head")[0] != null) document.getElementsByClassName("summary-head")[0].innerText = "Zusammenfassung";
        if (document.getElementsByClassName("summary-sub")[0] != null) document.getElementsByClassName("summary-sub")[0].innerText = "Von unserem KI-Modell generiert";
        if (document.getElementsByClassName("summary-main")[0] != null) document.getElementsByClassName("summary-main")[0].innerText = "ZUSAMMENFASSUNG";
        if (document.getElementById("summary-text") != null) document.getElementById("summary-text").innerText = "Zusammenfassung wird vorbereitet...";
        // Upvote Page
        if (document.getElementsByClassName("sub-feedback")[0] != null) document.getElementsByClassName("sub-feedback")[0].innerText = "Vielen Dank für Ihr Feedback!";    
    }
}*/
