chrome.commands.onCommand.addListener(async (command) => {
  if (command == "open_search_page") {
    chrome.tabs.create({
      url: "../data/pages/main/index.html"
    });
  }
});