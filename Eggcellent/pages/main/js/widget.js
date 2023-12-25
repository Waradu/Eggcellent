import { ContextMenu } from "./contextMenu.js";

export class Widget {
  constructor(title, description, type, image, icon) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = image;
    this.icon = icon;

    this.label = "Input:"
    this.needsConfirmation = false
    this.confirmationType = ""
    
    this.favorite = false;
    this.iconImage = false;

    this.contextMenu = new ContextMenu();
    this.runAction = () => {
      console.log("No action defined!");
    };
  }
}

export class Search {
  constructor(key, text, type, disableFuse = false) {
    this.key = key;
    this.text = text;
    this.type = type;
    this.disableFuse = disableFuse;
  }
}

export class TabWidget extends Widget {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;

    this.runAction = async (item) => {
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

      window.close();
      return false;
    }
  }
}

export class HistoryWidget extends Widget {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;

    this.runAction = async (item) => {
      window.location = result.URL;
      return false;
    }
  }
}

export class BookmarkWidget extends Widget {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;

    this.runAction = async (item) => {
      window.location = result.URL;
      return false;
    }
  }
}

export class ExtensionWidget extends Widget {
  constructor(title, description, type, imageURL, icon, ID) {
    super(title, description, type, imageURL, icon);

    this.ID = ID;

    this.runAction = async (item) => {
      window.location = result.URL;
      return false;
    }
  }
}
