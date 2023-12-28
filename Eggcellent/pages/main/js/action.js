export class Action {
  openTab(newTab = false) {
    var action = (item) => {
      if (newTab) {
        window.open(item.URL, "_blank");
      } else {
        window.location = item.URL;
      }
      return true;
    };
    return action;
  }

  openLink(link, newTab = false) {
    var action = (item) => {
      if (newTab) {
        window.open(link, "_blank");
      } else {
        window.location = link;
      }
      return true;
    };
    return action;
  }

  copyDescToClipboard() {
    var action = (item) => {
      navigator.clipboard.writeText(item.description);
      return false;
    };
    return action;
  }

  pinTab() {
    var action = (item) => {
      chrome.tabs.get(item.ID, (tab) => {
        chrome.tabs.update(item.ID, { pinned: !tab.pinned });
      });
      return false;
    };
    return action;
  }

  reloadTab() {
    var action = (item) => {
      chrome.tabs.reload(item.ID);
      return false;
    };
    return action;
  }

  clearHistory() {
    var action = async (item) => {
      await chrome.history.deleteAll();
      return true;
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
      return false;
    };
    return action;
  }

  closeTab() {
    var action = async (item) => {
      await chrome.tabs.remove(item.ID);
      return true;
    };
    return action;
  }

  changeSetting(setting, value) {
    var action = async (item) => {
      this.settings[setting].value = value;
      return true;
    };
    return action;
  }

  deleteHistory() {
    var action = async (item) => {
      await chrome.history.deleteUrl({ url: item.URL });
      return true;
    };
    return action;
  }

  deleteBookmark() {
    var action = async (item) => {
      await chrome.bookmarks.remove(item.ID);
      return true;
    };
    return action;
  }

  sort() {
    var action = async (item) => {
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

      return false;
    };
    
    return action;
  }
}
