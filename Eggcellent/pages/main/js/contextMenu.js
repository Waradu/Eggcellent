export class ContextMenu {
  constructor() {
    this.items = [];
  }

  append(item) {
    this.items.push(item);
  }
}

export class MenuItem {
  constructor(title, icon, type, runAction) {
    this.title = title;
    this.icon = icon;
    this.type = type;
    this.runAction = runAction;
    this.enabled = true;
    this.needsConfirmation = false;
    this.inputType = "none"; // Other options are "password", "email", "number" and "paragraph" !! Currently not implemented !!
    this.confirmationType = ""
  }
}
