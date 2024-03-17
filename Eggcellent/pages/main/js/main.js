import { ContextMenu, MenuItem } from "./contextMenu.js";
import {
  Search,
  Widget,
  TabWidget,
  HistoryWidget,
  BookmarkWidget,
  ExtensionWidget,
} from "./widget.js";
import { Action } from "./action.js";

const jsConfetti = new JSConfetti();

export class Main {
  constructor() {
    this.index = 0;
    this.oldIndex = -1;
    this.selectedIndex = -1;
    this.term = "";
    this.results = [];
    this.fuseResults = [];
    this.resultsCount = 0;

    this.confettiCount = 5;
    this.confettiSize = 5;

    this.selectedElement;

    this.inContextMenu = false;
    this.contextMenuIndex = 0;

    this.popupOpened = false;
    this.popupType = "";

    this.searchTag = document.getElementById("search");
    this.beforeTag = document.getElementById("before");
    this.resultTag = document.getElementById("results");
    this.resultsCountTag = document.getElementById("rcount");

    this.searchType = "all";
    this.searchTypes = [
      {
        key: ".",
        text: "Bookmarks:",
        type: "bookmark",
        disableFuse: false,
      },
      {
        key: ",",
        text: "History:",
        type: "history",
        disableFuse: false,
      },
      {
        key: ">",
        text: ">",
        type: "command",
        disableFuse: false,
      },
      {
        key: "",
        text: "Tabs:",
        type: "tab",
        disableFuse: false,
      },
      {
        key: "=",
        text: "=",
        type: "math",
        disableFuse: true,
      },
      {
        key: "-",
        text: "Extensions:",
        type: "extension",
        disableFuse: false,
      },
      /* {
        key: "<",
        text: "Todo:",
        type: "todo",
        disableFuse: true,
      }, */
      {
        key: "+",
        text: "Links:",
        type: "link",
        disableFuse: false,
      },
      {
        key: "$",
        text: "Speedtest...",
        type: "speed",
        disableFuse: true,
      },
      {
        key: ":",
        text: "Settings: ",
        type: "setting",
        disableFuse: false,
      },
      {
        key: "#",
        text: "Hex: ",
        type: "color",
        disableFuse: true,
      },
      {
        key: ";",
        text: "Search: ",
        type: "searchin",
        disableFuse: true,
      },
    ];

    this.widgets = [];

    this.patternsToExclude = ["chrome-extension://", "edge-extension://"];

    this.fuseOptions = {
      includeScore: true,
      threshold: 0.4,
      keys: ["title", "description"],
    };

    this.help = document.getElementById("help-overlay");
    this.helpToggle = document.getElementById("help-toggle");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const helpOpen = urlParams.get("help");

    if (helpOpen == "true") {
      this.help.classList.remove("closed");
    }

    this.searchTag.addEventListener("input", async (event) => {
      await this.search();
    });

    document.addEventListener("keydown", async (event) => {
      if (event.altKey && event.key === "?") {
        this.help.classList.toggle("closed");
        return;
      }
      this.handleNavigationKeys(event);
      this.handleSearchKeys(event);
      this.handleEnterKey(event);
    });

    document.getElementById("send").addEventListener("click", (e) => {
      if (
        document.getElementById("search").value != "" &&
        document.getElementById("before").innerHTML == ""
      )
        window.location = `https://www.google.com/search?q=${encodeURIComponent(
          document.getElementById("search").value
        )}`;
    });

    this.helpToggle.addEventListener("click", () => {
      this.help.classList.toggle("closed");
    });

    this.searchTag.focus();

    document.body.style.transition = "width .2s ease-in-out, background .2s";
    this.help.style.transition = "right 0.2s ease-in-out, filter .2s";
    this.helpToggle.style.transition = ".2s ease-in-out";

    this.settings = {
      useFuse: {
        value: true,
        type: "boolean",
        name: "Use Fuse Search",
        icon: "search",
        description: "Use Fuse",
        hidden: true,
      } /* currently blocks fuse function so this.fuseResults will never be set */,
      maxHistoryResults: {
        value: 50,
        type: "number",
        name: "Max History Results",
        icon: "history",
        description: "Limits the maximal count of history results",
        hidden: true,
      },
      blockConfirm: {
        value: false,
        type: "boolean",
        name: "Block Confirmation Popup",
        icon: "block",
        description:
          "Blocks the popup when for example clearing the browsing history",
        hidden: false,
      },
      darkMode: {
        value: true,
        type: "boolean",
        name: "Dark Mode",
        icon: "dark_mode",
        description: "Toggles between light and dark mode",
        hidden: false,
      },
      allowSpace: {
        value: true,
        type: "boolean",
        name: "Allow Space",
        icon: "space_bar",
        description: "allow space in addition to tabulator to activate filter",
        hidden: false,
      },
      showBrowserTabs: {
        value: true,
        type: "boolean",
        name: "Show Browser Tabs",
        icon: "tabs",
        description:
          "Show browser tabs in list like settings or extension page",
        hidden: true,
      },
      fuseThreshold: {
        value: 0.4,
        type: "number",
        name: "Fuse Threshold",
        icon: "data_thresholding",
        description:
          "Changes the fuse threshold do not change this unless u know what you are doing",
        hidden: true,
      },
      searchOnGoogle: {
        value: true,
        type: "boolean",
        name: "Search On Google",
        icon: "search",
        description:
          "If nothing is selected should it search on google if you press enter",
        hidden: false,
      },
    };
  }

  async init() {}

  async handleEnterKey(event) {
    if (event.key != "Enter") return;
    event.preventDefault();
    if (
      !this.inContextMenu &&
      !this.popupOpened &&
      this.term != "" &&
      this.beforeTag.innerHTML == "" &&
      this.selectedIndex == -1 &&
      this.settings.searchOnGoogle.value
    ) {
      window.location = `https://www.google.com/search?q=${encodeURIComponent(
        this.term
      )}`;
    }

    if (event.shiftKey) {
      this.showContextMenu();
      return;
    }

    if (this.popupOpened) {
      this.handleAction();
      return;
    }

    var item = {};

    if (this.inContextMenu) {
      item = this.selectedElement.contextMenu.items[this.contextMenuIndex];
    } else {
      item = this.selectedElement;
    }

    if (item.needsConfirmation || this.settings.blockConfirm.value) {
      this.showConfirm(item);
    } else {
      this.handleAction();
    }
  }

  showConfirm(item) {
    var overlay = document.getElementById("overlay");

    overlay.style.display = "flex";

    this.popupOpened = true;
  }

  async handleAction() {
    var item = {};

    if (this.inContextMenu) {
      item = this.selectedElement.contextMenu.items[this.contextMenuIndex];
    } else {
      item = this.selectedElement;
    }

    this.runAction(item);
  }

  async runAction(item) {
    var reload = false;

    if (item.confirmationType == "") {
      reload = await item.runAction(this.selectedElement);
    } else if (item.confirmationType == "text") {
      var text = document.getElementById("text-input");
      reload = await item.runAction(this.selectedElement, text.value);
      text.value = "";
    }

    if (this.inContextMenu) {
      this.showContextMenu();
    }

    this.closePopup();

    if (reload == "x") {
      var index = this.index;
      var selectedIndex = this.selectedIndex;

      var cm = document.getElementById("cm");
      cm.style.display = "none";
      this.inContextMenu = false;
      this.contextMenuIndex = 0;

      this.index = index;
      this.selectedIndex = selectedIndex;

      this.search(true, true, false);
    } else if (reload) {
      var cm = document.getElementById("cm");
      cm.style.display = "none";
      this.inContextMenu = false;
      this.contextMenuIndex = 0;

      this.search();
    }
  }

  closePopup() {
    var overlay = document.getElementById("overlay");
    overlay.style.display = "none";

    this.popupOpened = false;
  }

  addSearchType(s) {
    this.searchTypes.push(s.toObject());
  }

  addWidget(w) {
    this.widgets.push(w);
  }

  showContextMenu() {
    var result = this.selectedElement;

    if (result.contextMenu.items.length < 1) return;

    var cm = document.getElementById("cm");

    cm.style.display = "flex";

    cm.innerHTML = "";

    this.inContextMenu = true;

    cm.style.top = 70 + this.selectedIndex * 50 + "px";

    var notFound = true;

    if (!result.contextMenu.items[this.contextMenuIndex].enabled) {
      result.contextMenu.items.forEach((item, index) => {
        if (item != "separator") {
          if (item.enabled && notFound) {
            this.contextMenuIndex = index;
            notFound = false;
            return;
          }
        }
      });
    }

    result.contextMenu.items.forEach((item, index) => {
      if (item == "separator") {
        cm.innerHTML += '<div class="menu-separator"></div>';
      } else {
        cm.innerHTML += `
          <div class="menu-item ${item.type} ${
          item.enabled ? "" : "disabled"
        } ${this.contextMenuIndex == index ? "selected" : ""}">
            <div class="menu-item-icon material-symbols-rounded">${
              item.icon
            }</div>
            <div class="menu-item-text">${item.title} <span class="keys">${
          item.modifierKey != ""
            ? '<span class="key"' +
              (item.modifierKey ? "material-symbols-rounded" : "") +
              '">' +
              item.modifierKey +
              "</span>"
            : ""
        } ${
          item.key != ""
            ? '<span class="key"' +
              (item.keyIcon ? "material-symbols-rounded" : "") +
              '">' +
              item.key +
              "</span>"
            : ""
        }</span></div>
          </div>
        `;
      }
    });
  }

  async handleSearchKeys(event) {
    if (
      !this.popupOpened &&
      this.inContextMenu &&
      !(event.ctrlKey || event.altKey) &&
      !(
        event.key == "Enter" ||
        event.key == "ArrowUp" ||
        event.key == "ArrowDown" ||
        event.key == "Shift" ||
        event.key == "Escape"
      )
    ) {
      var cm = document.getElementById("cm");
      cm.style.display = "none";
      this.inContextMenu = false;
      this.contextMenuIndex = 0;
    }
    if (this.popupOpened && !(event.ctrlKey || event.altKey)) {
      event.preventDefault();
    }
    if (
      (event.ctrlKey ||
        event.altKey ||
        this.popupOpened ||
        this.inContextMenu) &&
      event.key != "Backspace"
    )
      return;

    if (
      /^[0-9a-zA-Z.,\-\<\>\=\:\;\$\+\§\#]$/.test(event.key) &&
      document.activeElement !== this.searchTag
    ) {
      event.preventDefault();
      this.searchTag.value += event.key;
      this.searchTag.focus();

      await this.search();
    }

    if (
      ((event.key == " " && this.settings.allowSpace.value) ||
        event.key == "Tab") &&
      this.searchTypes.some(
        (searchType) => searchType.key === this.searchTag.value
      ) &&
      this.beforeTag.innerHTML == ""
    ) {
      event.preventDefault();
      this.searchTypes.forEach((searchType) => {
        if (searchType.key == this.searchTag.value) {
          this.beforeTag.innerHTML = searchType.text;
          this.searchType = searchType.type;
        }
      });
      this.searchTag.value = "";
      this.searchTag.placeholder = "";

      await this.search();
    } else if (event.key == "Backspace" && this.searchTag.value == "") {
      this.beforeTag.innerHTML = "";
      this.searchTag.value = "";
      this.searchType = "all";

      this.searchTag.placeholder = "Search";

      await this.search();
    } else if (
      event.key == "Backspace" &&
      document.activeElement != this.searchTag
    ) {
      if (this.searchTag.value != "") {
        this.searchTag.value = this.searchTag.value.slice(0, -1);
        await this.search();
      } else {
        this.beforeTag.innerHTML = "";
        this.searchType = "all";

        this.searchTag.placeholder = "Search";
      }

      event.preventDefault();
      this.searchTag.focus();
      await this.search();
    } else if (event.key == "Tab" && document.activeElement == this.searchTag) {
      event.preventDefault();
    }
  }

  async handleNavigationKeys(event) {
    if (this.resultsCount <= 0) return;

    if (this.inContextMenu) {
      if (event.key == "ArrowUp") {
        event.preventDefault();
        this.contextMenuIndex -= 1;
        if (
          this.selectedElement.contextMenu.items[this.contextMenuIndex] ==
          "separator"
        ) {
          this.contextMenuIndex -= 1;
        }
        if (this.contextMenuIndex < 0) {
          this.contextMenuIndex =
            this.selectedElement.contextMenu.items.length - 1;
        }
        while (true) {
          try {
            if (
              this.selectedElement.contextMenu.items[this.contextMenuIndex]
                .enabled === false ||
              this.selectedElement.contextMenu.items[this.contextMenuIndex] ===
                "separator"
            ) {
              this.contextMenuIndex -= 1;
            } else {
              break;
            }
          } catch (error) {
            break; // Exit the loop on error.
          }
        }
        if (this.contextMenuIndex < 0) {
          this.contextMenuIndex =
            this.selectedElement.contextMenu.items.length - 1;
        }
        this.showContextMenu();
      } else if (event.key == "ArrowDown") {
        event.preventDefault();
        this.contextMenuIndex += 1;
        if (
          this.selectedElement.contextMenu.items[this.contextMenuIndex] ==
          "separator"
        ) {
          this.contextMenuIndex += 1;
        }
        if (
          this.contextMenuIndex == this.selectedElement.contextMenu.items.length
        ) {
          this.contextMenuIndex = 0;
        }
        this.showContextMenu();
      } else if (event.key == "Escape") {
        event.preventDefault();
        if (this.popupOpened) {
          var overlay = document.getElementById("overlay");
          overlay.style.display = "none";

          var confirm = document.getElementById("confirm");
          var cancel = document.getElementById("cancel");

          var clonedElement = confirm.cloneNode(true);
          confirm.parentNode.replaceChild(clonedElement, confirm);

          clonedElement = cancel.cloneNode(true);
          cancel.parentNode.replaceChild(clonedElement, cancel);

          this.popupOpened = false;
        } else {
          var cm = document.getElementById("cm");
          cm.style.display = "none";
          this.inContextMenu = false;
          this.contextMenuIndex = 0;
        }
      }

      return;
    }

    if (event.key == "ArrowUp") {
      event.preventDefault();
      await this.selectedElementHandler("up");
      await this.search(true);
    } else if (event.key == "ArrowDown") {
      event.preventDefault();
      await this.selectedElementHandler("down");
      await this.search(true);
    } else if (event.key == "Escape") {
      event.preventDefault();
      await this.selectedElementHandler("reset");
      await this.search(true);
    } else if (event.key == "Enter") {
      event.preventDefault();
      var arrowElement = document.getElementById("en");

      arrowElement.classList.add("active");

      setTimeout(() => {
        arrowElement.classList.remove("active");
      }, 150);
    }
  }

  async selectedElementHandler(command) {
    if (command == "up") {
      if (this.resultsCount < 8) {
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        } else {
          this.selectedIndex = this.resultsCount - 1;
        }
      } else if (this.selectedIndex == 0 && this.index > 0) {
        this.index--;
      } else if (this.selectedIndex > 0) {
        this.selectedIndex--;
      } else if (
        this.index == 0 &&
        (this.selectedIndex == 0 || this.selectedIndex == -1)
      ) {
        this.index = this.resultsCount - 8;
        this.selectedIndex = 7;
      }
    } else if (command == "down") {
      if (this.resultsCount < 8) {
        if (this.selectedIndex < this.resultsCount - 1) {
          this.selectedIndex++;
        } else {
          this.selectedIndex = 0;
        }
      } else if (
        this.selectedIndex == 7 &&
        this.index < this.resultsCount - 8
      ) {
        this.index++;
      } else if (this.selectedIndex < 7) {
        this.selectedIndex++;
      } else if (
        this.index == this.resultsCount - 8 &&
        this.selectedIndex == 7
      ) {
        this.index = 0;
        this.selectedIndex = 0;
      }
    } else if (command == "reset") {
      this.selectedIndex = -1;
      this.index = 0;
    }
  }

  getSearchTypeObject() {
    let result = null;

    for (let i = 0; i < this.searchTypes.length; i++) {
      let object = this.searchTypes[i];

      if (object.type === this.searchType) {
        result = object;
        break;
      }
    }

    return result == null ? false : result.disableFuse;
  }

  async fuseSearch() {
    var sortedMatches = this.results;

    var disableFuse = this.getSearchTypeObject();

    if (this.term != "" && !disableFuse) {
      const fuse = new Fuse(this.results, this.fuseOptions);

      const results = fuse.search(this.term);

      results.sort((a, b) => {
        if (a.item.favorite && !b.item.favorite) {
          return -1;
        }
        if (b.item.favorite && !a.item.favorite) {
          return 1;
        }
        return a.score - b.score;
      });

      sortedMatches = results.map((result) => result.item);
    }

    this.resultsCount = sortedMatches.length;

    var count = this.resultsCount > 8 ? 8 : this.resultsCount;

    if (this.index >= this.resultsCount) this.index = this.resultsCount - 1;

    this.fuseResults = sortedMatches.slice(this.index, this.index + count);

    if (this.index > this.resultsCount - count && this.selectedIndex > 0) {
      this.fuseResults = sortedMatches.slice(this.index - count, this.index);
    } else if (this.index < count - 1) {
      this.fuseResults = sortedMatches.slice(this.index, this.index + count);
    } else {
      this.fuseResults = sortedMatches.slice(this.index, this.index + count);
    }
  }

  hexToRgb(hex) {
    hex = hex.replace(/^#/, "");

    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    return r + "," + g + "," + b;
  }

  async setResults() {
    this.results = [];

    var action = new Action();

    if (this.searchType == "all" || this.searchType == "tab") {
      var result = await chrome.tabs.query({});
      /* result = result.filter(
        (item) =>
          !this.patternsToExclude.some((pattern) => item.url.includes(pattern))
      ); */
      result.forEach((tab) => {
        var tabObj = new TabWidget(
          tab.title,
          tab.url,
          "tab",
          tab.favIconUrl,
          "toolbar",
          tab.url,
          tab.id
        );

        var focusTab = new MenuItem(
          "Focus Tab",
          "center_focus_strong",
          "normal",
          action.focusTab()
        );
        tabObj.contextMenu.append(focusTab);

        var openTab = new MenuItem(
          "Open",
          "open_in_new",
          "normal",
          action.openTab()
        );
        tabObj.contextMenu.append(openTab);

        var reloadTab = new MenuItem(
          "Reload Tab",
          "refresh",
          "normal",
          action.reloadTab()
        );
        tabObj.contextMenu.append(reloadTab);

        tabObj.contextMenu.append("separator");

        var pinTab = new MenuItem(
          "Toggle Pin",
          "push_pin",
          "favorite",
          action.pinTab()
        );
        tabObj.contextMenu.append(pinTab);

        var copyURL = new MenuItem(
          "Copy URL",
          "content_copy",
          "link",
          action.copyDescToClipboard()
        );
        tabObj.contextMenu.append(copyURL);

        var closeTab = new MenuItem(
          "Close Tab",
          "close",
          "danger",
          action.closeTab()
        );
        tabObj.contextMenu.append(closeTab);

        this.results.push(tabObj);
      });
    }

    if (this.searchType == "all" || this.searchType == "bookmark") {
      var bookmark = await new Promise((resolve, reject) => {
        const bookmarkList = [];

        chrome.bookmarks.getTree(function (tree) {
          const traverse = (node) => {
            if (node.children) {
              node.children.forEach((child) => {
                if (child.url) {
                  var image = `https://www.google.com/s2/favicons?domain=${child.url}&sz=128`;

                  var bookmarkObj = new BookmarkWidget(
                    child.title,
                    child.url,
                    "bookmark",
                    image,
                    "bookmark",
                    child.url,
                    child.id
                  );

                  var open = new MenuItem(
                    "Open",
                    "open_in_new",
                    "normal",
                    action.openTab()
                  );
                  bookmarkObj.contextMenu.append(open);

                  bookmarkObj.contextMenu.append("separator");

                  var copyURL = new MenuItem(
                    "Copy URL",
                    "content_copy",
                    "link",
                    action.copyDescToClipboard()
                  );
                  bookmarkObj.contextMenu.append(copyURL);

                  var deleteBookmark = new MenuItem(
                    "Delete Bookmark",
                    "delete",
                    "danger",
                    action.deleteBookmark()
                  );
                  bookmarkObj.contextMenu.append(deleteBookmark);

                  bookmarkList.push(bookmarkObj);
                }
                traverse(child);
              });
            }
          };
          traverse(tree[0]);
          resolve(bookmarkList);
        });
      });

      bookmark = bookmark.filter(
        (item) =>
          !this.patternsToExclude.some((pattern) => item.URL.includes(pattern))
      );

      this.results = this.results.concat(bookmark);
    }

    if (this.searchType == "all" || this.searchType == "history") {
      var result = await chrome.history.search({
        text: "",
        maxResults: this.settings.maxHistoryResults.value,
        startTime: 100 * 60 * 60 * 60 * 24 * 30 * 12,
      });
      result = result.filter(
        (item) =>
          !this.patternsToExclude.some((pattern) => item.url.includes(pattern))
      );
      result.forEach((history) => {
        var image = `https://www.google.com/s2/favicons?domain=${history.url}&sz=128`;

        var historyObj = new HistoryWidget(
          history.title,
          history.url,
          "history",
          image,
          "history",
          history.url,
          history.id
        );

        var open = new MenuItem(
          "Open",
          "open_in_new",
          "normal",
          action.openTab()
        );
        historyObj.contextMenu.append(open);

        historyObj.contextMenu.append("separator");

        var copyURL = new MenuItem(
          "Copy URL",
          "content_copy",
          "link",
          action.copyDescToClipboard()
        );
        historyObj.contextMenu.append(copyURL);

        var deleteHistory = new MenuItem(
          "Delete",
          "delete",
          "danger",
          action.deleteHistory()
        );
        deleteHistory.key = "del";

        historyObj.contextMenu.append(deleteHistory);

        var clearHistory = new MenuItem(
          "Clear History!",
          "delete",
          "danger",
          action.clearHistory()
        );

        clearHistory.modifierKey = "shift";
        clearHistory.modifierKeyIcon = true;

        clearHistory.needsConfirmation = true;

        clearHistory.key = "del";
        historyObj.contextMenu.append(clearHistory);

        this.results.push(historyObj);
      });
    }

    if (this.searchType == "math") {
      var extension = new Widget(
        math.evaluate(this.term) || "Error",
        `Solved: ${this.term}`,
        "math",
        "https://cdn-icons-png.flaticon.com/512/212/212376.png",
        "calculate"
      );

      var copyResult = new MenuItem(
        "Copy Result",
        "content_copy",
        "link",
        (item) => {
          navigator.clipboard.writeText(item.title);
          return false;
        }
      );
      extension.contextMenu.append(copyResult);

      this.results.push(extension);
    }

    if (this.searchType === "speed") {
      var imageAddr =
        "http://wallpaperswide.com/download/shadow_of_the_tomb_raider_2018_puzzle_video_game-wallpaper-7680x4800.jpg" +
        "?n=" +
        Math.random();

      var startTime, endTime;
      var downloadSize = 5616998;
      var download = new Image();
      var roundedDecimals = 2;
      var bytesInAKilobyte = 1024;

      const speed = (bitsPerSecond) => {
        var KBps = (bitsPerSecond / bytesInAKilobyte).toFixed(roundedDecimals);
        if (KBps <= 1) return { value: bitsPerSecond, units: "Bps" };
        var MBps = (KBps / bytesInAKilobyte).toFixed(roundedDecimals);
        if (MBps <= 1) return { value: KBps, units: "KBps" };
        else return { value: MBps, units: "MBps" };
      };

      download.onload = () => {
        endTime = new Date().getTime();

        var duration = (endTime - (startTime + 50)) / 1000;
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(roundedDecimals);
        var displaySpeed = speed(speedBps);

        var extension = new Widget(
          "Upload: " + displaySpeed.value + " " + displaySpeed.units,
          `Tested with 5.36MB`,
          "speed",
          "https://play-lh.googleusercontent.com/xKUdbWyGGv4lbYH5Fzrz-USBEKk84Aw43IPmnl9VVq4jewz4y8JrwOivPsAYCtTbDbdt",
          "speed"
        );

        this.results.push(extension);

        this.search(true, false, true);
      };

      startTime = new Date().getTime();
      download.src = imageAddr;
    }

    if (this.searchType == "command") {
      var command = new Widget(
        "Confetti",
        "Accomplished something? Celebrate with confetti!",
        "command",
        "https://th.bing.com/th/id/R.900f199ffaba8ab6d89703723422b01c?rik=HUQPszUeQ9ao1Q&pid=ImgRaw&r=0",
        "celebration"
      );

      command.runAction = () => {
        jsConfetti.addConfetti({
          confettiRadius: this.confettiSize,
          confettiNumber: 100 * this.confettiCount,
        });
        if (this.confettiCount < 10) {
          this.confettiCount += 1;
        }
        if (this.confettiSize < 7) {
          this.confettiSize += 0.5;
        }
      };

      this.results.push(command);
    }

    if (this.searchType == "todo") {
      var add = new Widget(
        "Add new todo",
        "Add a new item to your todo list",
        "todo",
        "add",
        "list"
      );

      add.iconImage = true;
      add.needsConfirmation = true;
      add.confirmationType = "text";

      this.results.push(add);

      var show = new Widget(
        "Show archived todos",
        "Show all the completed todos",
        "todo",
        "archive",
        "list"
      );

      show.iconImage = true;

      this.results.push(show);
    }

    if (this.searchType == "link") {
      var yt = new Widget(
        "Waradu - Youtube",
        "Subscribe to my youtube",
        "link",
        "https://avatars.githubusercontent.com/u/89935135?v=4",
        "link"
      );

      yt.runAction = action.openLink("https://www.youtube.com/@waradu");

      this.results.push(yt);

      var gh = new Widget(
        "Waradu - Github",
        "See my projects in github",
        "link",
        "https://avatars.githubusercontent.com/u/89935135?v=4",
        "link"
      );

      gh.runAction = action.openLink("https://github.com/Waradu/");

      this.results.push(gh);

      var egg = new Widget(
        "Eggcellent - Github",
        "Star eggcellent github repo",
        "link",
        "../../../assets/icons/512x512.png",
        "link"
      );

      egg.runAction = action.openLink("https://github.com/Waradu/Eggcellent");

      this.results.push(egg);
    }

    if (this.searchType == "setting") {
      for (const [key, value] of Object.entries(this.settings)) {
        if (value.type == "boolean" && !value.hidden) {
          var setting = new Widget(
            value.name,
            value.description,
            "setting",
            value.icon == "" ? "settings" : value.icon,
            value.value ? "toggle_on" : "toggle_off"
          );

          setting.iconImage = true;

          if (key == "darkMode") {
            setting.runAction = (item) => {
              this.settings[key].value = !this.settings[key].value;
              if (this.settings[key].value) {
                document.documentElement.classList.remove("light");
                document.documentElement.style.setProperty(
                  "--color",
                  "#181a24"
                );
              } else {
                document.documentElement.classList.add("light");
                document.documentElement.style.setProperty(
                  "--color",
                  "#f2f8fc"
                );
              }
              return "x";
            };
          } else {
            setting.runAction = (item) => {
              this.settings[key].value = !this.settings[key].value;
              return "x";
            };
          }

          this.results.push(setting);
        }
      }
    }

    if (this.searchType == "color") {
      var result = "";

      if (this.isValidHexCode(this.term)) {
        result = this.hexToRgb(this.term);
      }

      var rgb = new Widget(
        'Hexcode: <strong class="upper">' + this.term + "</strong>",
        "RGB: " + result,
        "palette",
        "invert_colors",
        "link"
      );

      rgb.iconImage = true;

      if (this.isValidHexCode(this.term)) {
        rgb.runAction = action.copyTerm(result);
      }

      this.results.push(rgb);
    }

    if (this.searchType == "searchin") {
      var searchengines = [
        {
          name: "google",
          domain: "https://www.google.com",
          search_domain: "https://www.google.com/search?q=",
        },
        {
          name: "youtube",
          domain: "https://www.youtube.com",
          search_domain: "https://www.youtube.com/results?search_query=",
        },
        {
          name: "reddit",
          domain: "https://www.reddit.com",
          search_domain: "https://www.reddit.com/search/?q=",
        },
        {
          name: "twitter",
          domain: "https://twitter.com",
          search_domain: "https://twitter.com/search?q=",
        },
        {
          name: "bing",
          domain: "https://www.bing.com",
          search_domain: "https://www.bing.com/search?q=",
        },
        {
          name: "duckduckgo",
          domain: "https://duckduckgo.com",
          search_domain: "https://duckduckgo.com/?q=",
        },
      ];

      var term = encodeURIComponent(this.term);

      searchengines.forEach((engine) => {
        var searchURL = engine.search_domain + term;
        var faviconURL = `https://www.google.com/s2/favicons?domain=${engine.domain}&sz=128`;

        var searchin = new Widget(
          engine.name,
          searchURL,
          "searchin",
          faviconURL,
          "link"
        );

        searchin.runAction = action.openLink(searchURL);

        this.results.push(searchin);
      });
    }

    this.widgets.forEach((widget) => {
      if (this.searchType == widget.type) {
        this.results.push(widget);
      }
    });

    if (this.searchType == "extension") {
      let extensions = await chrome.management.getAll();

      for (const ext of extensions) {
        if (ext.type === "extension") {
          var icon = "";

          try {
            icon = ext.icons[ext.icons.length - 1].url;
          } catch {}

          var extension = new ExtensionWidget(
            ext.name,
            ext.description,
            "extension",
            icon,
            "extension"
          );

          var version = new MenuItem(
            "Version: " + ext.version,
            "conversion_path",
            "normal",
            (item) => {}
          );

          version.enabled = false;

          extension.contextMenu.append(version);

          var enabled = new MenuItem(
            "Enabled: " + ext.enabled,
            "radio_button_partial",
            "normal",
            (item) => {}
          );

          enabled.enabled = false;

          extension.contextMenu.append(enabled);

          extension.contextMenu.append("separator");

          var toggle = new MenuItem(
            "Toggle Extension",
            "extension",
            "normal",
            async (item) => {
              const info = await new Promise((resolve) => {
                chrome.management.get(ext.id, (extensionInfo) => {
                  resolve(extensionInfo);
                });
              });

              const newState = !info.enabled;
              chrome.management.setEnabled(ext.id, newState);

              item.contextMenu.items[1].title = "Enabled: " + newState;
              return false;
            }
          );

          if (ext.id != chrome.runtime.id) {
            extension.contextMenu.append(toggle);
          }

          var toggle = new MenuItem(
            "Copy Name",
            "content_copy",
            "link",
            (item) => {
              navigator.clipboard.writeText(ext.name);
              return false;
            }
          );
          extension.contextMenu.append(toggle);

          if (ext.id != chrome.runtime.id) {
            extension.contextMenu.append("separator");
          }

          var copyResult = new MenuItem(
            "Copy ID",
            "content_copy",
            "link",
            (item) => {
              navigator.clipboard.writeText(ext.id);
              return false;
            }
          );
          extension.contextMenu.append(copyResult);

          var uninstall = new MenuItem(
            "Uninstall",
            "delete",
            "danger",
            (item) => {
              chrome.management.uninstall(ext.id);
              return true;
            }
          );

          if (ext.id != chrome.runtime.id) {
            extension.contextMenu.append(uninstall);
          }

          this.results.push(extension);
        }
      }
    }

    this.results.sort((a, b) => {
      if (a.type === "tab" && b.type !== "tab") {
        return -1;
      }
      if (a.type !== "tab" && b.type === "tab") {
        return 1;
      }

      if (a.favorite && !b.favorite) {
        return -1;
      }
      if (b.favorite && !a.favorite) {
        return 1;
      }
    });
  }

  async setHTML() {
    this.resultsCountTag.innerHTML =
      this.resultsCount > 0
        ? `${this.index + this.selectedIndex + 1}/${this.resultsCount}`
        : "No results found";

    var height = this.resultsCount > 8 ? 400 : this.resultsCount * 50;

    this.resultTag.style.height = (height < 50 ? 50 : height) + "px";

    this.resultTag.innerHTML = "";

    var index = 0;
    this.fuseResults.forEach((ele) => {
      this.resultTag.innerHTML += `
        <div class="result ${
          ele.type
        }" data-index="${index++}" style="--delay: ${index / 30}s;">
          <img src="${
            ele.imageURL == "" || ele.iconImage
              ? "./assets/transparent.png"
              : ele.imageURL
          }" class="icon" title="${ele.imageURL}" style="${
        ele.iconImage ? "display: none" : ""
      }">
          <div class="icon material-symbols-rounded" title="${
            ele.type
          }" style="${ele.iconImage ? "" : "display: none"}">${
        ele.imageURL
      }</div>
          <div class="text"><span>${ele.title}</span><div class="desc">${
        ele.description
      }</div></div>
          ${
            ele.favorite
              ? '<div class="qa-icon favorite material-symbols-rounded" title="Favorite">star</div>'
              : ""
          }
          <div class="qa-icon material-symbols-rounded" title="${ele.type}">${
        ele.icon
      }</div>
        </div>
      `;
    });

    Array.from(document.querySelectorAll("img.icon")).forEach((ele) => {
      ele.onerror = () => {
        ele.onerror = null;
        ele.src = "../main/assets/transparent.png";
      };
    });

    if (this.resultsCount == 0) {
      if (this.searchType != "speed") {
        this.resultTag.innerHTML += `
          <div title="Error: No results found!" class="result always-select" data-index="-1" style="--delay: 0s;">
            <div class="icon material-symbols-rounded" style="color: #ff6666;">close</div>
            <div class="text">No results found!<div class="desc">Maybe try to use another search term!</div></div>
            <div class="qa-icon material-symbols-rounded"></div>
          </div>
        `;
      } else {
        this.resultTag.innerHTML += `
          <div title="Testing..." class="result blue" data-index="-1" style="--delay: 0s;">
            <div class="icon material-symbols-rounded rotate" style="color: #6666ff;">autorenew</div>
            <div class="text">Testing...<div class="desc">This could take a while</div></div>
          </div>
        `;
      }
    }
  }

  isValidHexCode(hex) {
    hex = hex.replace("#", "");

    return /^[0-9A-Fa-f]{6}$/.test(hex);
  }

  async search(reset = false, resetResults = false, setIndex = false) {
    if (this.settings.darkMode.value) {
      document.documentElement.style.setProperty("--color", "#181a24");
    } else {
      document.documentElement.style.setProperty("--color", "#f2f8fc");
    }

    this.term = this.searchTag.value;

    if (this.searchType == "color" && this.isValidHexCode(this.term)) {
      document.documentElement.style.setProperty(
        "--color",
        "#" + this.term.replace("#", "")
      );
    } else if (this.searchType == "color") {
      document.documentElement.style.setProperty("--color", this.term);
    }

    if (!reset) {
      await this.setResults();
      this.selectedIndex = -1;
      this.index = 0;
    }

    if (setIndex) {
      this.selectedIndex = -1;
      this.index = 0;
    }

    if (resetResults) {
      await this.setResults();
    }

    if (this.settings.useFuse.value) {
      await this.fuseSearch();
    }
    await this.setHTML();

    var result = document.querySelectorAll(".result");
    if (this.selectedIndex >= 0) {
      result[this.selectedIndex].classList.add("selected-result");
      this.selectedElement = this.fuseResults[this.selectedIndex];
    } else {
      this.selectedElement = {};
    }
    result.forEach((ele) => {
      ele.addEventListener("click", async (event) => {
        result.forEach((el) => {
          el.classList.remove("selected-result");
        });

        this.selectedIndex = parseInt(ele.dataset.index);
        this.selectedElement = this.fuseResults[this.selectedIndex];
        result[this.selectedIndex].classList.add("selected-result");
        this.selectedElement = this.fuseResults[this.selectedIndex];
        await this.handleAction();
      });
    });
  }
}
