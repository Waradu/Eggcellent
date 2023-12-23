export class ContextMenu {
  constructor() {
    this.items = [];
  }

  append(item) {
    this.items.push(item);
  }
}

export class MenuItem {
  constructor(title, icon, type, action) {
    this.title = title;
    this.icon = icon;
    this.type = type;
    this.action = action;
    this.modifierKey = "";
    this.key = "";
    this.modifierKeyIcon = false;
    this.keyIcon = false;
    this.enabled = true;
    this.closeMenuOnAction = false;
    this.needsConfirmation = false;
    this.inputType = "none"; // Other options are "password", "email", "number" and "paragraph" !! Currently not implemented !!
  }
}

export class MenuItemAction {
  openTab(newTab = false) {
    var action = (item) => {
      if (newTab) {
        window.open(item.URL, "_blank");
      } else {
        window.location = item.URL;
      }
      return true
    };
    return action;
  }

  copyDescToClipboard() {
    var action = (item) => {
      navigator.clipboard.writeText(item.description);
      return false
    };
    return action;
  }

  pinTab() {
    var action = (item) => {
      chrome.tabs.get(item.ID, (tab) => {
        chrome.tabs.update(item.ID, { pinned: !tab.pinned });
      });
      return false
    };
    return action;
  }

  reloadTab() {
    var action = (item) => {
      chrome.tabs.reload(item.ID);
      return false
    };
    return action;
  }

  clearHistory() {
    var action = async (item) => {
      await chrome.history.deleteAll();
      return true
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
      return false
    };
    return action;
  }

  closeTab() {
    var action = async (item) => {
      await chrome.tabs.remove(item.ID);
      return true
    };
    return action;
  }

  deleteHistory() {
    var action = async (item) => {
      await chrome.history.deleteUrl({ url: item.URL });
      return true
    };
    return action;
  }

  deleteBookmark() {
    var action = async (item) => {
      await chrome.bookmarks.remove(item.ID);
      return true
    };
    return action;
  }
}
