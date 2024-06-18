class Widget {
  private big_text: string = "";
  private small_text: string = "";
  private result_type: string = "";
  private image_url: string = "";
  private icon_name: string = "";
  private use_image: boolean = false;
  private actionFunction: () => Promise<boolean> = async () => false;

  constructor(
    title?: string,
    description?: string,
    type?: string,
    image?: string,
    icon?: string,
    useImage?: boolean
  ) {
    this.big_text = title || "";
    this.small_text = description || "";
    this.result_type = type || "";
    this.image_url = image || "";
    this.icon_name = icon || "";
    this.use_image = useImage || false;
  }

  title<T extends string | undefined>(
    title?: T
  ): T extends string ? this : string {
    if (title) {
      this.big_text = title;
      return this as any;
    } else {
      return this.big_text as any;
    }
  }

  description<T extends string | undefined>(
    description?: T
  ): T extends string ? this : string {
    if (description) {
      this.small_text = description;
      return this as any;
    } else {
      return this.small_text as any;
    }
  }

  type<T extends string | undefined>(
    type?: T
  ): T extends string ? this : string {
    if (type) {
      this.result_type = type;
      return this as any;
    } else {
      return this.result_type as any;
    }
  }

  image<T extends string | undefined>(
    image?: T
  ): T extends string ? this : string {
    if (image) {
      this.image_url = image;
      return this as any;
    } else {
      return this.image_url as any;
    }
  }

  icon<T extends string | undefined>(
    icon?: T
  ): T extends string ? this : string {
    if (icon) {
      this.icon_name = icon;
      return this as any;
    } else {
      return this.icon_name as any;
    }
  }

  useImage<T extends boolean | undefined>(
    useImage?: T
  ): T extends boolean ? this : boolean {
    if (useImage) {
      this.use_image = useImage;
      return this as any;
    } else {
      return this.use_image as any;
    }
  }

  action(
    actionFunction?: () => Promise<boolean>
  ): this | (() => Promise<boolean>) {
    if (actionFunction) {
      this.actionFunction = actionFunction;
      return this;
    } else {
      return this.actionFunction;
    }
  }

  async run(): Promise<boolean> {
    return await this.actionFunction();
  }
}

export function widget(
  title?: string,
  description?: string,
  type?: string,
  image?: string,
  icon?: string,
  useImage?: boolean
): Widget {
  return new Widget(title, description, type, image, icon, useImage);
}

class Search {
  private seach_key: string = "";
  private seach_text: string = "";
  private seach_type: string = "";
  private disable_fuse: boolean = false;

  constructor(
    key?: string,
    text?: string,
    type?: string,
    disable_fuse?: boolean
  ) {
    this.seach_key = key || "";
    this.seach_text = text || "";
    this.seach_type = type || "";
    this.disable_fuse = disable_fuse || false;
  }

  key<T extends string | undefined>(key?: T): T extends string ? this : string {
    if (key) {
      this.seach_key = key;
      return this as any;
    } else {
      return this.seach_key as any;
    }
  }

  text<T extends string | undefined>(
    text?: T
  ): T extends string ? this : string {
    if (text) {
      this.seach_text = text;
      return this as any;
    } else {
      return this.seach_text as any;
    }
  }

  type<T extends string | undefined>(
    type?: T
  ): T extends string ? this : string {
    if (type) {
      this.seach_type = type;
      return this as any;
    } else {
      return this.seach_type as any;
    }
  }

  disableFuse<T extends boolean | undefined>(
    disable_fuse?: T
  ): T extends boolean ? this : boolean {
    if (disable_fuse) {
      this.disable_fuse = disable_fuse;
      return this as any;
    } else {
      return this.disable_fuse as any;
    }
  }
}

export function search(
  key?: string,
  text?: string,
  type?: string,
  disable_fuse?: boolean
): Search {
  return new Search(key, text, type, disable_fuse);
}

class TabWidget extends Widget {
  tab_URL: string = "";
  tab_ID: string = "";

  constructor(
    title?: string,
    description?: string,
    image?: string,
    icon?: string,
    useImage?: boolean,
    URL?: string,
    ID?: string
  ) {
    super(title, description, "tab", image, icon, useImage);

    this.tab_URL = URL || "";
    this.tab_ID = ID || "";
  }

  url<T extends string | undefined>(url?: T): T extends string ? this : string {
    if (url) {
      this.tab_URL = url;
      return this as any;
    } else {
      return this.tab_URL as any;
    }
  }

  id<T extends string | undefined>(id?: T): T extends string ? this : string {
    if (id) {
      this.tab_ID = id;
      return this as any;
    } else {
      return this.tab_ID as any;
    }
  }
}

export function tabWidget(
  title?: string,
  description?: string,
  type?: string,
  image?: string,
  icon?: string,
  useImage?: boolean,
  URL?: string,
  ID?: string
): TabWidget {
  return new TabWidget(title, description, image, icon, useImage, URL, ID);
}

class HistoryWidget extends Widget {
  history_URL: string = "";
  history_ID: string = "";

  constructor(
    title?: string,
    description?: string,
    image?: string,
    icon?: string,
    useImage?: boolean,
    URL?: string,
    ID?: string
  ) {
    super(title, description, "history", image, icon, useImage);

    this.history_URL = URL || "";
    this.history_ID = ID || "";
  }

  url<T extends string | undefined>(url?: T): T extends string ? this : string {
    if (url) {
      this.history_URL = url;
      return this as any;
    } else {
      return this.history_URL as any;
    }
  }

  id<T extends string | undefined>(id?: T): T extends string ? this : string {
    if (id) {
      this.history_ID = id;
      return this as any;
    } else {
      return this.history_ID as any;
    }
  }
}

export function historyWidget(
  title?: string,
  description?: string,
  image?: string,
  icon?: string,
  useImage?: boolean,
  URL?: string,
  ID?: string
): HistoryWidget {
  return new HistoryWidget(title, description, image, icon, useImage, URL, ID);
}

class BookmarkWidget extends Widget {
  bookmark_URL: string = "";
  bookmark_ID: string = "";

  constructor(
    title?: string,
    description?: string,
    image?: string,
    icon?: string,
    useImage?: boolean,
    URL?: string,
    ID?: string
  ) {
    super(title, description, "bookmark", image, icon, useImage);

    this.bookmark_URL = URL || "";
    this.bookmark_ID = ID || "";
  }

  url<T extends string | undefined>(url?: T): T extends string ? this : string {
    if (url) {
      this.bookmark_URL = url;
      return this as any;
    } else {
      return this.bookmark_URL as any;
    }
  }

  id<T extends string | undefined>(id?: T): T extends string ? this : string {
    if (id) {
      this.bookmark_ID = id;
      return this as any;
    } else {
      return this.bookmark_ID as any;
    }
  }
}

export function bookmarkWidget(
  title?: string,
  description?: string,
  image?: string,
  icon?: string,
  useImage?: boolean,
  URL?: string,
  ID?: string
): BookmarkWidget {
  return new BookmarkWidget(title, description, image, icon, useImage, URL, ID);
}

class ExtensionWidget extends Widget {
  extension_ID: string = "";

  constructor(
    title?: string,
    description?: string,
    image?: string,
    icon?: string,
    useImage?: boolean,
    ID?: string
  ) {
    super(title, description, "extension", image, icon, useImage);

    this.extension_ID = ID || "";
  }

  id<T extends string | undefined>(id?: T): T extends string ? this : string {
    if (id) {
      this.extension_ID = id;
      return this as any;
    } else {
      return this.extension_ID as any;
    }
  }
}

export function extensionWidget(
  title?: string,
  description?: string,
  image?: string,
  icon?: string,
  useImage?: boolean,
  ID?: string
): ExtensionWidget {
  return new ExtensionWidget(title, description, image, icon, useImage, ID);
}

export type Widgets =
  | Widget
  | TabWidget
  | HistoryWidget
  | BookmarkWidget
  | ExtensionWidget;
