import { Results } from "../modules/results.js";
import { MenuItem } from "../modules/contextMenu.js"
import { Widget, Action } from "../modules/widget.js"

var results = new Results()

const actions = new Action()

const sortWidget = new Widget(
  "Sort Open Tabs",
  "Sort all your opend tabs in groups and more",
  "command",
  "",
  "sort",
  actions.sort
);

var copyResult = new MenuItem(
  "Sort tabs",
  "sort",
  "default",
  actions.sort
);

sortWidget.contextMenu.append(copyResult);

results.addWidget(sortWidget)

results.search()