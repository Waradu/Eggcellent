chrome.commands.onCommand.addListener(async (command) => {
  if (command == "open_search_page") {
    chrome.tabs.create({
      url: "../data/pages/main/index.html"
    });
  }
  if (command === "inject-script") {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // get the current tab ID
      let tabId = tabs[0].id;
      // inject the script file
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["../data/pages/main/script.js"]
      });
      // inject the CSS file
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["../data/pages/main/style.css"]
      });
    });
  }
});