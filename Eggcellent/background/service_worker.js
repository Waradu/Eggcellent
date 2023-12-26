chrome.commands.onCommand.addListener(async (command) => {
  if (command == "open_search_page") {
    var tabs = await chrome.tabs.query({ currentWindow: true });

    tabs.forEach(function (tab) {
      if (tab.url == "chrome://newtab/" || tab.url == "edge://newtab/") {
        chrome.tabs.remove(tab.id);
      }
    });

    var tabWithUrl = tabs.filter(function (tab) {
      return tab.url.endsWith("/pages/main/index.html");
    });

    if (tabWithUrl.length > 0) {
      chrome.tabs.update(tabWithUrl[0].id, { active: true });
    } else {
      chrome.tabs.create({
        url: "../pages/main/index.html",
      });
    }
  }
});

chrome.runtime.onInstalled.addListener(function (object) {
  let internalUrl = chrome.runtime.getURL("pages/main/index.html?help=true");

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({ url: internalUrl });
  }
});