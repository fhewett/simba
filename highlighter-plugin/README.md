# Highlighter Plugin Integration: Firefox

This is a tutorial for installing any work in progress version of the plugin for Firefox.
If you want to install the stable version for Firefox, check out [the Simba Add-On on the Firefox](https://addons.mozilla.org/en-US/firefox/addon/simba-text-assistant/).

## Installing on Firefox
- Open the page [about:debugging](about:debugging)
- Click the **This Firefox** option, on the left side of your screen
- Now click the **Load Temporary Add-on** button
- In the Popup menu now navigate into the **root folder** of the Plugin (Remember: the root folder of the Plugin is where the **manifest.json** file is located)
- Select any file in this directory and hit enter
- The Plugin should now run in your firefox!

### Adding the extension to the tool bar
Adding the extension to the tool bar makes it way easier to use and test out and I'll explain how you can do that here:
- Look at the top-right corner of your Browser, where you will see the **Extensions Icon** (it should look like a puzzle piece) and click on it
- In the Dropdown Menu you should see our Extension. now click on the little **cog icon**
- A new Dropdown Menu shows, where you can select **Add to tool bar**, which should permanently add the Extension to the toolbar (until the next restart)

## Final Notes
- Remember: after you close your browser the Plugin is no longer installed so you have to repeat the steps shown above to install it yet again (and add it to the toolbar)
