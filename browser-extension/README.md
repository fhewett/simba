# Simba Browser Extension

**Please note: these are instructions for the developer versions, the official versions can be found in the Chrome/Firefox Extension Stores**

This is a tutorial for installing the 'work in progress' version of the browser extensions for Chrome/Firefox.
You can find the stable versions of Simba on [Firefox Add-ons website](https://addons.mozilla.org/de/firefox/addon/simba-text-assistant/) and [Chrome Web Store](https://chromewebstore.google.com/detail/simba-text-assistant/lllfbelghpclobblmackbkheabbhfdhf). 

## Installing on Chrome
- Pull this repository (or download as .zip)
- Make sure you have the **Developer Mode** enabled
- Open the page [chrome://extensions/](chrome://extensions/)
- Click on **Load unpacked extension**
- Navigate to the root folder of the extension
- Click **Open** and the extension should now be added!

## Installing on Firefox
- Open the page [about:debugging](about:debugging)
- Click the **This Firefox** option, on the left side of your screen
- Now click the **Load Temporary Add-on** button
- In the Popup menu now navigate into the **root folder** of the Extension (Remember: the root folder of the Extension is where the **manifest.json** file is located)
- Select any file in this directory and hit enter
- The extension should now run in your firefox!

### Adding the extension to the tool bar
Adding the extension to the tool bar makes it way easier to use and test out. 
- Look at the top-right corner of your Browser, where you will see the **Extensions Icon** (it should look like a puzzle piece) and click on it
- In the Dropdown Menu you should see our Extension. now click on the little **cog icon**
- A new Dropdown Menu shows, where you can select **Add to tool bar**, which should add the Extension to the toolbar (until the next restart)

## Final Notes
- Remember: after you close your browser the extension is no longer installed so you have to repeat the steps shown above to install it yet again (and add it to the toolbar)


