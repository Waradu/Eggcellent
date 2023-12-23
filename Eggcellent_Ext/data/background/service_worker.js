chrome.commands.onCommand.addListener(async (command) => {
  if (command == "open_search_page") {
    var tabs = await chrome.tabs.query({ currentWindow: true });

    tabs.forEach(function (tab) {
      if (tab.url == "chrome://newtab/" || tab.url == "edge://newtab/") {
        chrome.tabs.remove(tab.id);
      }
    });

    var tabWithUrl = tabs.filter(function (tab) {
      return tab.url.endsWith("/data/pages/main/index.html");
    });

    if (tabWithUrl.length > 0) {
      chrome.tabs.update(tabWithUrl[0].id, { active: true });
    } else {
      chrome.tabs.create({
        url: "../data/pages/main/index.html",
      });
    }
  }
  if (command === "inject-script") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["../data/pages/main/script.js"],
      });
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ["../data/pages/main/style.css"],
      });
    });
  }
});

/* chrome.tabs.onCreated.addListener(function (tab) {
  if (
    tab.pendingUrl == "chrome://newtab/" ||
    tab.pendingUrl == "edge://newtab/"
  ) {
    setTimeout(() => {
      chrome.tabs.update(tab.id, { url: "youtube.com", active: true });
    }, 1000);
  }
}); */
