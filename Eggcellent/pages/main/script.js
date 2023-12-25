import { Main } from "./js/main.js";
import { MenuItem } from "./js/contextMenu.js"
import { Widget } from "./js/widget.js"
import { Action } from "./js/action.js"

var results = new Main()

const actions = new Action()

const sortWidget = new Widget(
  "Sort Open Tabs",
  "Sort all your opend tabs in groups and more",
  "command",
  "",
  "sort",
);

sortWidget.runAction = actions.sort();

var copyResult = new MenuItem(
  "Sort tabs",
  "sort",
  "default"
);

copyResult.runAction = actions.sort();

sortWidget.contextMenu.append(copyResult);

results.addWidget(sortWidget)

results.search()