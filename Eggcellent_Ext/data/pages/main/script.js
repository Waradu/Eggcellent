import { Results } from "../modules/results.js";
import { MenuItem } from "../modules/contextMenu.js"
import { Widget } from "../modules/widget.js"

var results = new Results()

const sortTabs = async () => {
  const tabs = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  tabs.forEach(function (tab) {
    chrome.tabs.ungroup(tab.id);
  });

  tabs.sort(function (a, b) {
    var titleA = a.title.toLowerCase();
    var titleB = b.title.toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });

  for (var i = 0; i < tabs.length; i++) {
    chrome.tabs.move(tabs[i].id, { index: i });
  }

  const tabsByDomain = {};

  tabs.forEach(function (tab) {
    if (tab.url == "chrome://newtab/" || tab.url == "edge://newtab/") {
      chrome.tabs.remove(tab.id);
    } else {
      const domain = new URL(tab.url).hostname;
      if (!tabsByDomain[domain]) {
        tabsByDomain[domain] = { groupTitle: domain, tabs: [] };
      }
      tabsByDomain[domain].tabs.push(tab);
    }
  });

  const sortedTabGroups = Object.values(tabsByDomain).sort(function (a, b) {
    return a.groupTitle.localeCompare(b.groupTitle);
  });

  for (const group of sortedTabGroups) {
    const tabIds = group.tabs.map((tab) => tab.id);

    var group_id = await chrome.tabs.group({ tabIds });

    chrome.tabGroups.update(group_id, {
      title: group.groupTitle,
      collapsed: true,
    });
  }

  const ungroup = await chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  ungroup.forEach(function (tab) {
    const domain = new URL(tab.url).hostname;
    const group = tabsByDomain[domain];
    if (group.tabs.length === 1) {
      chrome.tabs.ungroup(tab.id);
    }
  });

  var groups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  });

  groups.reverse();

  groups.forEach(function (group) {
    chrome.tabGroups.move(group.id, { index: 0 });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const focusedTab = tabs[0];
  
    if (focusedTab) {
      chrome.tabs.move(focusedTab.id, { index: 0 });
    }
  });
}

const sortWidget = new Widget(
  "Sort Open Tabs",
  "Sort all your opend tabs in groups and more",
  "command",
  "",
  "sort",
  sortTabs
);

var copyResult = new MenuItem(
  "Sort tabs",
  "sort",
  "default",
  sortTabs
);

sortWidget.contextMenu.append(copyResult);

results.addWidget(sortWidget)

results.search()