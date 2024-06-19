"use strict";

let summaryUUID = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DBG: popup.js DOMContentLoaded event fired!');   
  document.getElementById('message-box').innerText = 'Extrahieren des Seiteninhalts...'; // 'Getting page content...';
      
  // let's send a message to content.js to get the active page's content
  function fetchContent(retryCount = 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;      
      chrome.tabs.sendMessage(tabId, { action: "getPageContent" }, (response) => {
        if (response) {
          // lastly: we send this content to the Simba server to produce simplified summary 
          document.getElementById('message-box').innerText = 'Warten auf den Simba-Server...'; // "Waiting for Simba server...";
          callSimbaSimplifyApi(response.text, response.url);  
        } else if (retryCount < 4) {
          // sometimes the getpagecontent can be slow, so retrying is needed
          // (note, this should be abandoned if the popup is already closed.) 
          console.error('popup.js: Failed to get content, retrying...');
          setTimeout(() => fetchContent(retryCount + 1), 500);
        } else {
          console.error('popup.js: Failed to get content after retries');
          document.getElementById('message-box').innerText = "Seiteninhalt nicht abrufbar!"; // Cannot get this page's content
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
            console.log('popup.js: Got Simba simplify API results:', data);
	          document.getElementById('message-box').innerText = data.output; // display server output
	          document.getElementById('progressbar').style.display = "none";  // hide progress bar
        } else {
            console.error('popup.js: Bad server response for simba simplify api');
            document.getElementById('message-box').innerText = 'Simba-Server-Fehlerstatus: ' + response.status;
        }
    } catch (error) {
        console.error('popup.js: Error during simba simplify api:', error);
        document.getElementById('message-box').innerText = 'Fehler beim Verbinden mit dem Simba-Server: ' + error;
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
            console.log('popup.js: Server response ok for Simba feedback API');
        } else {
            console.error('popup.js: Bad server response for Simba feedback API: ', response.status);
        }
    } catch (error) {
        console.error('popup.js: Error during Simba feedback API:', error);
    }
}


