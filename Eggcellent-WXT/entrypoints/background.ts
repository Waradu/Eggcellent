export default defineBackground(() => {
  /* browser.commands.onCommand.addListener(async (command) => {
    if (command == "open_search_page") {
      var tabs = await browser.tabs.query({ currentWindow: true });

      var tabWithUrl = tabs.filter(function (tab) {
        var url = new URL(tab.url);
        url.search = "";
        return url.toString().endsWith("/newtab.html");
      });

      if (tabWithUrl.length > 0) {
        browser.tabs.update(tabWithUrl[0].id, { active: true });
      } else {
        browser.tabs.create({
          url: "../pages/main/index.html",
        });
      }

      tabs.forEach(function (tab) {
        if (tab.url == "chrome://newtab/" || tab.url == "edge://newtab/") {
          browser.tabs.remove(tab.id);
        }
      });
    }
  });

  browser.runtime.onInstalled.addListener(function (object) {
    let internalUrl = browser.runtime.getURL("newtab.html?help=true");

    if (object.reason == "install") {
      browser.tabs.create({ url: internalUrl });
    }
  }); */
});
