import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: [
      "storage",
      "tabs",
      "tabGroups",
      "bookmarks",
      "history",
      "management",
    ],
    commands: {
      open_search_page: {
        suggested_key: {
          default: "Alt+S",
        },
        description: "Open the Search page",
      },
    },
  },
});
