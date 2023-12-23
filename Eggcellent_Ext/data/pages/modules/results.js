import { ContextMenu, MenuItem, MenuItemAction } from "./contextMenu.js";

const jsConfetti = new JSConfetti();

export class Results {
  constructor() {
    this.index = 0;
    this.oldIndex = -1;
    this.selectedIndex = -1;
    this.term = "";
    this.results = [];
    this.fuseResults = [];
    this.resultsCount = 0;

    this.selectedElement;

    this.inContextMenu = false;
    this.contextMenuIndex = 0;

    this.popupOpened = false;

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
        text: "Command:",
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
    ];

    this.widgets = []

    this.patternsToExclude = [
      "chrome://",
      "chrome-extension://",
      "edge://",
      "edge-extension://",
    ];

    this.fuseOptions = {
      includeScore: true,
      threshold: 0.4,
      keys: ["title", "description"],
    };

    this.searchTag.addEventListener("input", async (event) => {
      await this.search();
    });

    document.addEventListener("keydown", async (event) => {
      this.handleNavigationKeys(event);
      this.handleSearchKeys(event);
      this.handleDelKey(event);
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

    this.searchTag.focus();
  }

  addSearchType(s) {
    this.searchTypes.push(s.toObject());
  }

  addWidget(w) {
    this.widgets.push(w);
  }

  async handleDelKey(event) {
    return;
    if (event.key != "Delete" || this.resultsCount <= 0 || this.popupOpened)
      return;
    if (this.selectedIndex != -1) {
      var result = this.selectedElement;

      if (result.type == "history") {
        chrome.history.deleteUrl({ url: result.description });
      }

      if (result.type == "bookmark") {
        chrome.bookmarks.remove(result.ID);
      }

      if (result.type == "tab") {
        chrome.tabs.remove(result.ID);
      }
    }
    await this.search(true, true);
  }

  async handleEnterKey(event) {
    if (event.key != "Enter") return;
    event.preventDefault();

    if (this.popupOpened) {
      var item = this.selectedElement.contextMenu.items[this.contextMenuIndex];

      var reload = await item.action(this.selectedElement);

      if (reload) {
        var cm = document.getElementById("cm");
        cm.style.display = "none";
        this.inContextMenu = false;
        this.contextMenuIndex = 0;

        this.search();
      }

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
      if (this.selectedIndex != -1 && this.resultsCount > 0) {
        if (event.shiftKey) {
          this.showContextMenu();
        } else {
          var item =
            this.selectedElement.contextMenu.items[this.contextMenuIndex];
          if (this.inContextMenu) {
            if (item.needsConfirmation) {
              var overlay = document.getElementById("overlay");
              var confirm = document.getElementById("confirm");
              var cancel = document.getElementById("cancel");

              overlay.style.display = "flex";

              this.popupOpened = true;

              var runEvent = confirm.addEventListener("click", async () => {
                await item.action(this.selectedElement);
                overlay.style.display = "none";
                confirm.removeEventListener("click", runEvent);
                cancel.removeEventListener("click", cancelEvent);
                this.popupOpened = false;

                this.search();
                this.showContextMenu();
              });

              var cancelEvent = cancel.addEventListener("click", () => {
                overlay.style.display = "none";
                cancel.removeEventListener("click", cancelEvent);
                confirm.removeEventListener("click", runEvent);
                this.popupOpened = false;

                this.search();
              });
            } else {
              var reload = await item.action(this.selectedElement);
              if (reload) {
                var cm = document.getElementById("cm");
                cm.style.display = "none";
                this.inContextMenu = false;
                this.contextMenuIndex = 0;

                this.search();
              } else {
                this.showContextMenu();
              }
            }
          } else {
            await this.useResult();
          }
        }
      } else if (this.searchTag.value != "" && this.beforeTag.innerHTML == "") {
        if (this.isURL(document.getElementById("search").value)) {
          window.location = this.formatURL(
            encodeURIComponent(document.getElementById("search").value)
          );
        } else {
          window.location = `https://www.google.com/search?q=${encodeURIComponent(
            document.getElementById("search").value
          )}`;
        }
      }
    }
  }

  isURL(text) {
    var urlPattern =
      /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]{2,5})?([a-zA-Z0-9\/#?=.&_\-]*)$/;

    return urlPattern.test(text);
  }

  formatURL(text) {
    if (!/^https?:\/\//i.test(text)) {
      text = "https://" + text;
    }
    return text;
  }

  async useResult() {
    var result = this.selectedElement;

    if (result.type == "tab") {
      const tabGroups = await chrome.tabGroups.query({});

      var tab = await chrome.tabs.get(parseInt(result.ID));

      chrome.windows.update(tab.windowId, {
        focused: true,
      });

      chrome.tabs.update(parseInt(result.ID), { active: true });

      var tab = await chrome.tabs.get(parseInt(result.ID));

      for (const tabGroup of tabGroups) {
        if (tabGroup.id === tab.groupId) continue;
        await chrome.tabGroups.update(tabGroup.id, {
          collapsed: tabGroup.collapsed,
        });
      }

      window.close();
    } else if (result.type == "math") {
      navigator.clipboard.writeText(result.title);
    } else if (
      result.type == "link" ||
      result.type == "history" ||
      result.type == "bookmark"
    ) {
      window.location = result.URL;
    } else {
      await result.runAction(result)
    }
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
      /^[0-9a-zA-Z.,\-\<\>\=]$/.test(event.key) &&
      document.activeElement !== this.searchTag
    ) {
      event.preventDefault();
      this.searchTag.value += event.key;
      this.searchTag.focus();

      await this.search();
    }

    if (
      (event.key == " " || event.key == "Tab") &&
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

  async setResults() {
    this.results = [];

    var action = new MenuItemAction();

    if (this.searchType == "all" || this.searchType == "tab") {
      var result = await chrome.tabs.query({});
      result = result.filter(
        (item) =>
          !this.patternsToExclude.some((pattern) => item.url.includes(pattern))
      );
      result.forEach((tab) => {
        var image = `https://www.google.com/s2/favicons?domain=${tab.url}&sz=128`;

        var tabObj = new TabResult(
          tab.title,
          tab.url,
          "tab",
          image,
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

                  var bookmarkObj = new BookmarkResult(
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
      var result = await chrome.history.search({ text: "", maxResults: 50 });
      result = result.filter(
        (item) =>
          !this.patternsToExclude.some((pattern) => item.url.includes(pattern))
      );
      result.forEach((history) => {
        var image = `https://www.google.com/s2/favicons?domain=${history.url}&sz=128`;

        var historyObj = new HistoryResult(
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
      var extension = new Result(
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

    if (this.searchType == "command") {
      var command = new Result(
        "Confetti",
        "Accomplished something? Celebrate with confetti!",
        "command",
        "https://th.bing.com/th/id/R.900f199ffaba8ab6d89703723422b01c?rik=HUQPszUeQ9ao1Q&pid=ImgRaw&r=0",
        "celebration"
      );

      command.runAction = () => {
        jsConfetti.addConfetti()
      }

      this.results.push(command);
    }

    this.widgets.forEach((widget) => {
      if (this.searchType == widget.type) {
        this.results.push(widget);
      }
    })

    if (this.searchType == "extension") {
      let extensions = await chrome.management.getAll();

      for (const ext of extensions) {
        if (ext.type === "extension") {
          var icon = "";

          try {
            icon = ext.icons[ext.icons.length - 1].url;
          } catch {}

          var extension = new ExtensionResult(
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

      /* const nameA = a.title.toLowerCase();
      const nameB = b.title.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0; */
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
          <img src="${ele.imageURL == '' ? "./transparent.png" : ele.imageURL}" class="icon" title="${ele.imageURL}">
          <div class="text"><span title="${ele.title}">${
        ele.title
      }</span><div class="desc" title="${ele.description}">${
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

    if (this.resultsCount == 0) {
      this.resultTag.innerHTML += `
        <div title="Error: No results found!" class="result always-select" data-index="-1" style="--delay: 0s;">
          <div class="icon material-symbols-rounded" style="color: #ff6666;">close</div>
          <div class="text">No results found!<div class="desc">Maybe try to use another search term!</div></div>
          <div class="qa-icon material-symbols-rounded"></div>
        </div>
      `;
    }
  }

  async search(reset = false, resetResults = false) {
    this.term = this.searchTag.value;

    if (!reset) {
      await this.setResults();
      this.selectedIndex = -1;
      this.index = 0;
    }

    if (resetResults) {
      await this.setResults();
    }

    await this.fuseSearch();
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
        await this.useResult();
      });
    });
  }
}

export class Result {
  constructor(title, description, type, image, icon) {
    this.title = title;
    this.description = description;
    this.type = type;
    this.imageURL = image;
    this.icon = icon;

    this.favorite = false;

    this.contextMenu = new ContextMenu();
    this.runAction = () => {
      console.log("No action defined!");
    };
  }
}

export class TabResult extends Result {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;
  }
}

export class HistoryResult extends Result {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;
  }
}

export class BookmarkResult extends Result {
  constructor(title, description, type, imageURL, icon, URL, ID) {
    super(title, description, type, imageURL, icon);

    this.URL = URL;
    this.ID = ID;
  }
}

export class ExtensionResult extends Result {
  constructor(title, description, type, imageURL, icon, ID) {
    super(title, description, type, imageURL, icon);

    this.ID = ID;
  }
}
