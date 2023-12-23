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
