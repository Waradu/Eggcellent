export class contextMenu {
  constructor() {
    this.items = [];
  }

  append(item) {
    this.items.push(item);
  }
}

export class menuItem {
  constructor(title, icon, type, action) {
    this.title = "";
    this.icon = "";
    this.type = "";
    this.action = (item) => {};
    this.clickable = true;
    this.enabled = true;
    this.closeMenuOnAction = false;
    this.needsConfirmation = false;
    this.inputType = "none"; // Other options are "password", "email", "number" and "paragraph" !! Currently not implemented !!
  }
}

export class menuItemAction {
  openTab(newTab) {
    var action = (item) => {
      window.open(item.URL, newTab ? "_blank" : "");
    };
    return action;
  }

  copyDescToClipboard() {
    var action = (item) => {
      navigator.clipboard.writeText(item.URL);
    };
    return action;
  }

  pinTab() {
    var action = (item) => {
      chrome.tabs.update(item.ID, { pinned: true });
    };
    return action;
  }

  reloadTab() {
    var action = (item) => {
      chrome.tabs.reload(item.ID);
    };
    return action;
  }

  clearHistory() {
    var action = async (item) => {
      chrome.history.deleteAll();
    };
    return action;
  }

  focusTab() {
    var action = async (item) => {
      const tabGroups = await chrome.tabGroups.query({});

      var tab = await chrome.tabs.get(parseInt(item.ID));

      chrome.windows.update(tab.windowId, {
        focused: true,
      });

      chrome.tabs.update(parseInt(item.ID), { active: true });

      var tab = await chrome.tabs.get(parseInt(item.ID));

      for (const tabGroup of tabGroups) {
        if (tabGroup.id === tab.groupId) continue;
        await chrome.tabGroups.update(tabGroup.id, {
          collapsed: tabGroup.collapsed,
        });
      }
    };
    return action;
  }

  closeTab() {
    var action = (item) => {
      chrome.tabs.remove(item.ID);
    };
    return action;
  }

  deleteHistory() {
    var action = (item) => {
      chrome.history.deleteUrl({ url: item.URL });
    };
    return action;
  }

  deleteBookmark() {
    var action = (item) => {
      chrome.bookmarks.remove(item.ID);
    };
    return action;
  }
}
