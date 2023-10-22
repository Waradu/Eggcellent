export class contextMenu {
  constructor() {
    this.title = ""
    this.items = []
  }

  append(item) {
    this.items.push(item)
  }
}

export class menuItem {
  constructor() {
    this.title = ""
    this.icon = ""
    this.action = (item) => {}
    this.clickable = true
  }
}

export class menuItemAction {
  openTab(newTab) {
    var action = (item) => {
      window.open(item.url, newTab ? "_blank" : "")
    }
    return action
  }
}