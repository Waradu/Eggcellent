import { ContextMenu } from "./contextMenu.js";

export class Widget {
  constructor(
    title,
    description,
    type,
    image,
    icon,
    runAction = () => {
      console.log("No action defined!");
    }
  ) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = image;
    this.icon = icon;

    this.label = "Input:"
    this.needsConfirmation = false
    this.confirmationType = ""

    this.iconImage = false;
    this.favorite = false;

    this.contextMenu = new ContextMenu();
    this.runAction = runAction
  }
}

export class Search {
  constructor(key, text, type, disableFuse = false) {
    this.key = key;
    this.text = text;
    this.type = type;
    this.disableFuse = disableFuse;
  }

  toObject() {
    return {
      key: this.key,
      text: this.text,
      type: this.type,
      disableFuse: this.disableFuse,
    };
  }
}

export class Action {
  async sort() {
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
}