// 手動バンドル
const __DEFAULT__ = "__default";
const __moduleByPath = new Map();
const __definerByPath = new Map();
function __modules(path, definer) {
  __definerByPath.set(path, definer);
  __moduleByPath.set(path, {});
}

function __import(path, name = __DEFAULT__) {
  if (__definerByPath.has(path)) {
    (__definerByPath.get(path))(__moduleByPath.get(path));
    __definerByPath.delete(path);
  }
  return __moduleByPath.get(path)[name];
}

__modules("./App.js", (
  __exports,
  Root = __import("./Block/Root.js"),
  Filter = __import("./Filter/Filter.js"), 
  Filters = __import("./Filter/Filters.js"),
) => {
  __exports[__DEFAULT__] = class App {
    static root;
    static options;
    static filter;
    static data;
    static async boot(data = {}, options = {}) {
      this.data = data;
      this.options = this.getOptions(options);
      this.filter = await this.getFilter();
  
      this.root = new Root(this);
      await this.root.build();
    }
  
    static getBaseName() {
      const scriptName = location.href.split("/").pop();
      if (scriptName) {
        // delete .ext
        const names = scriptName.split(".");
        names.pop();
        return names.join(".");
      } else {
        return scriptName;
      }
    }
  
    static getOptions(options) {
      /**
       * spaPath {string} spa folder path, default "(html)-spa"
       * localFilter {boolean} use local filter, default false
       * filterPath {string} local filter path, default "(html)-spa/module/filter, require localFilter"
       */
      const baseName = this.getBaseName();
      options.spaPath = options.spaPath ?? `${baseName}-spa`;
      options.filterPath = options.localFilter ? (options.filterPath ?? `${options.spaPath}/module/filter`) : null;
      return options;
    }
  
    static async getFilter() {
      await Filter.registLocalFilter(App?.options?.localFilter, App?.options?.filterPath);
      return Filters;
    }
  }
  return __exports;
});

__modules("./Block/Root.js", (
  __exports,
  container = __import("./Block/Container.js"),
  BlockBuilder = __import("./Block/BlockBuilder.js"),
) => {
  __exports[__DEFAULT__] = class Root {
    #blocks = [];
    #app;
    constructor(app) {
      this.#app = app;
      const Container = container.constructor;
      Container.regist(container, "options", this.#app.options);
      Container.regist(container, "data", this.#app.data);
    }
    
    async build() {
      this.#blocks.push(...await BlockBuilder.build(document.body));
    }
  
    async notifyAll(pattern, indexes, fromBlock) {
      for(const block of this.#blocks) {
        block.notifyAll(pattern, indexes, fromBlock);
      }
    }
  
    async inquiryAll(message, param1, param2, fromBlock) {
      for(const block of this.#blocks) {
        block.inquiryAll(message, param1, param2, fromBlock);
      }
    }
  
  }
  return __exports;
});

__modules("./Block/Container.js", (
  __exports,
  Container = __import("./Container/Container.js"),
  BlockLoader = __import("./Block/BlockLoader.js"),
  Block = __import("./Block/Block.js"),
) => {
  class BlockContainer extends Container {
    registData = [
      ["blockLoader", BlockLoader, "options"],
      ["block", Block, "data"],
    ];
  }
  
  const blockContainer = BlockContainer.registAll(new BlockContainer());
  __exports[__DEFAULT__] = blockContainer;
  return __exports;
});

__modules("./Block/BlockBuilder.js", (
  __exports,
//  container = __import("./Block/Container.js"),
) => {
  const QUERY_BLOCK = "[data-x\\:block]";
  const DATASET_BLOCK = "x:block";
  const DATASET_WITH_BIND_CSS = "x:withBindCss"; // notice: camel case
  
  __exports[__DEFAULT__] = class BlockBuilder {
    static collect(rootElement) {
      return Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
    }
  
    static async createBlock(element) {
      const container = __import("./Block/Container.js");
      const blockName = element.dataset[DATASET_BLOCK];
      const withBindCss = DATASET_WITH_BIND_CSS in element.dataset;
      const block = container.block;
      await block.load(blockName, element, withBindCss);
      await block.build();
      return block;
    }
  
    static async build(rootElement) {
      return await Promise.all(this.collect(rootElement).map(element => this.createBlock(element)));
    }
  }
  return __exports;
});

__modules("./Container/Container.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class Container {
    #valueByName = new Map;
    #classByName = new Map;
  
    registData = [];
  
    static registAll(container, registData = container.registData) {
      registData.forEach(([ name, value, ...dependencies ]) => {
        Container.regist(container, name, value, ...dependencies);
      });
      return container;
    }
  
    static regist(container, name, value, ...dependencies) {
      if (typeof value === "function") {
        container.#classByName.set(name, value);
      } else {
        container.#valueByName.set(name, value);
      }
      Object.defineProperty(container, name, {
        configurable: true,
        get: () => {
          if (container.#valueByName.has(name)) {
            return container.#valueByName.get(name);
          }
          if (container.#classByName.has(name)) {
            const className = container.#classByName.get(name);
            const value = new className(...(dependencies.map(prop => container[prop])));
            return value;
          }
        }
      });
  
    }
  }
  
  return __exports;
});

__modules("./Block/BlockLoader.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class BlockLoader {
    #options;
  
    constructor(options) {
      this.#options = options;
    }
  
    async load(name, withBindCss) {
      const [html, css, module, bindCss] = await Promise.all([
        this.#loadParts(name)
        .then(res => {
          if (!res.ok) {
            console.error('response.ok:', response.ok);
            console.error('esponse.status:', response.status);
            console.error('esponse.statusText:', response.statusText);
            throw new Error(res.statusText);
          }
          return res.text();
        })
        .catch(e => {
          console.log(e);
          throw `parts (${name}) load fail`;
        }),
        new Promise((resolve, reject) => {
          this.#loadCss(name)
          .then(res => {
            if (!res.ok) {
              console.error('response.ok:', response.ok);
              console.error('esponse.status:', response.status);
              console.error('esponse.statusText:', response.statusText);
              throw new Error(res.statusText);
            }
            return res.text();
          })
          .then(txt => {
            resolve(txt);
          }).catch(e => {
            resolve(null);
          });
        }),
        this.#loadScript(name).catch(e => {
          console.error(e);
          throw e;
        }),
        new Promise((resolve, reject) => {
          if (!withBindCss) {
            resolve(null);
          } else {
            this.#loadBindCss(name)
            .then(res => {
              if (!res.ok) {
                console.error('response.ok:', response.ok);
                console.error('esponse.status:', response.status);
                console.error('esponse.statusText:', response.statusText);
                throw new Error(res.statusText);
              }
              return res.text();
            })
            .then(txt => {
              resolve(txt);
            }).catch(e => {
              reject();
            });
    
          }
        }),
      ]);
      const template = this.#createTemplate({name, html, css, bindCss});
      document.body.appendChild(template);
      return { template, module};
    }
  
    #loadScript(name, spaPath = this.#options?.spaPath) {
      if (spaPath != null && (spaPath.startsWith("https://") || spaPath.startsWith("http://"))) {
        return import(`${spaPath}/module/${name}.js`);
      } else {
        const index = document.baseURI.lastIndexOf("/");
        if (index >= 0) {
          const base = document.baseURI.slice(0, index + 1);
          return import(`${base}${spaPath}/module/${name}.js`);
        }
        return import(`${spaPath}/module/${name}.js`);
      }
    }
  
    #loadParts(name, spaPath = this.#options?.spaPath) {
      return fetch(`${spaPath}/html/${name}.html`);
    }
  
    #loadCss(name, spaPath = this.#options?.spaPath) {
      return fetch(`${spaPath}/css/${name}.css`);
    }
  
    #loadBindCss(name, spaPath = this.#options?.spaPath) {
      return fetch(`${spaPath}/css/${name}.bind.css`);
    }
  
    #createTemplate({name, html, css, bindCss}) {
      const template = document.createElement("template");
      template.innerHTML = html;
      if (css != null) {
        template.innerHTML = "<style>\n" + css + "\n</style>\n" + template.innerHTML;
      }
      if (bindCss != null) {
        template.innerHTML = "<style data-x:rules=\"bind\">\n" + bindCss + "\n</style>\n" + template.innerHTML;
      }
      template.dataset[`block`] = name;
      return template;
    }
  }
  return __exports;
});

__modules("./Block/Block.js", (
  __exports,
  Context = __import("./View/Context.js"), // **
//  container = __import("./Block/Container.js"),
  BlockBuilder = __import("./Block/BlockBuilder.js"),
  Rules = __import("./Bind/Rules.js"), // **
) => {
  __exports[__DEFAULT__] = class Block {
    #name;
    #context;
    #blocks = [];
    #data;
    #dialog;
  
    constructor(data, dialog = null) {
      this.#data = data;
      this.#dialog = dialog;
    }
  
    get context() { return this.#context; }
    get name() { return this.#name; }
  
    createContext(name, parentElement) {
      this.#name = name;
      this.#context = new Context(this, parentElement);
      this.#context.build();
      return this.#context;
    }
  
    async load(name, parentElement, withBindCss) {
      const context = this.createContext(name, parentElement);
      const dialog = this.#dialog;
      try {
        const container = __import("./Block/Container.js");
        const loader = container.blockLoader;
        const {template, module} = await loader.load(name, withBindCss);
    
        context.template = template;
        context.module = module;
        context.viewModel = 
          module.default?.viewModel ?? 
          (module.default?.AppViewModel != null ? Reflect.construct(module.default.AppViewModel, []) : {});
        //context.bindRules.push(...module.default?.bindRules ?? []);
        context.dependencyRules.push(...module.default?.dependencyRules ?? []);
        const reflectContext = module.default?.context ?? module.default?._;
        (reflectContext != null) && context.reflect(reflectContext, dialog);
  
        context.rootElement = template.content.cloneNode(true);
        context.bindRules.push(...Rules.collect(context.rootElement));
  
        console.log(module.default);
      } catch(e) {
        throw e;
      }
    }
  
    async build(context = this.#context, data = this.#data) {
      context.properties.build();
      context.dependencies.build();
      context.dataReflecter.reflect(context, this.#data, context.viewModel);
  
      const initializer = context.initializer;
      await initializer.init(context, data);
      context.properties.expandAll();
      context.view.build();
      this.#blocks.push(...await BlockBuilder.build(context.rootElement));
      context.view.appear();
    }
  
    async notifyAll(pattern, indexes, fromBlock) {
      const notifier = this.#context.notifier;
      const viewModel = this.#context.viewModel;
      const eventHandler = this.#context.eventHandler;
      const viewUpdater = this.#context.viewUpdater;
      for(const block of this.#blocks) {
        block.notifyAll(pattern, indexes, fromBlock);
      }
      (fromBlock !== this) && viewUpdater.updateProcess(
        async () => {
          const result = eventHandler.exec(viewModel, "notifyAll", pattern, indexes, fromBlock);
          const notify = () => notifier.notify(pattern);
          (result instanceof Promise) ? result.then(notify) : notify();
          return result;
        }
      );
    }
  
    async inquiryAll(message, param1, param2, fromBlock) {
      const viewModel = this.#context.viewModel;
      const eventHandler = this.#context.eventHandler;
      const viewUpdater = this.#context.viewUpdater;
      for(const block of this.#blocks) {
        block.inquiryAll(message, param1, param2, fromBlock);
      }
      (fromBlock !== this) && viewUpdater.updateProcess(
        async () => eventHandler.exec(viewModel, "inquiryAll", message, param1, param2, fromBlock)
      );
    }
  }  
  return __exports;
});

__modules("./Filter/Filter.js", (
  __exports,
  _ = __import("./Filter/Builtin.js"),
) => {
  class Filter {
    static async registLocalFilter(localFilter, filterPath) {
      if (localFilter) {
        const index = document.baseURI.lastIndexOf("/");
        const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
        await import(`${base}${filterPath}/regist.js`);
      }
    }
  }
  
  __exports[__DEFAULT__] = Filter;
  return __exports;
});

__modules("./Filter/Builtin.js", (
  __exports,
  Filters = __import("./Filter/Filters.js"),
) => {
  Filters.regist("falsey", {
    forward(value, options = []) {
      return !(value);
    }
  });
  
  Filters.regist("not", {
    forward(value, options = []) {
      return !value;
    }
  });
  
  Filters.regist("null", {
    forward(value, options = []) {
      return value == null;
    }
  });
  
  Filters.regist("style-display", {
    forward(value, options = []) {
      return value ? "" : "none";
    }
  });
  
  Filters.regist("locale-string", {
    forward(value, options = []) {
      return Number(value).toLocaleString();
    }
  });
  
  Filters.regist("fixed", {
    forward(value, options = []) {
      return Number(value).toFixed(options[0] ?? 0);
    }
  });
  
  Filters.regist("ge", {
    forward(value, options = []) {
      return Number(value) >= Number(options[0] ?? 0);
    }
  });
  
  Filters.regist("gt", {
    forward(value, options = []) {
      return Number(value) > Number(options[0] ?? 0);
    }
  });
  
  Filters.regist("le", {
    forward(value, options = []) {
      return Number(value) <= Number(options[0] ?? 0);
    }
  });
  
  Filters.regist("lt", {
    forward(value, options = []) {
      return Number(value) < Number(options[0] ?? 0);
    }
  });
  
  Filters.regist("number-value", {
    forward(value, options = []) {
      return value?.toString() ?? "";
    },
    backward(value, options = []) {
      return (value !== "") ? Number(value) : null;
    },
  });
  return __exports;
});

__modules("./Filter/Filters.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class Filters {
    static filterByName = new Map();
  
    static regist(name, filter) {
      this.filterByName.set(name, filter);
    }
  
    static forward(filters, value) {
      const exec = (info,value) => info.filter.forward(value, info.options);
      return filters.reduce((value, info) => ("forward" in info.filter) ? exec(info, value) : value, value)
    }
  
    static backward(filters, value) {
      const exec = (info,value) => info.filter.backward(value, info.options);
      return filters.reduce((value, info) => ("backward" in info.filter) ? exec(info, value) : value, value)
    }
  }
  return __exports;
});

__modules("./View/Context.js", (
  __exports,
  ViewContainer = __import("./View/Container.js"),
//  App = __import("./App.js"),
  ViewBuilder = __import("./View/ViewBuilder.js"),
//  Dialog = __import("./Dialog/Dialog.js"),
  PropertyName = __import("./ViewModel/PropertyName.js"),
  EventHandler = __import("./ViewModel/EventHandler.js"),
  Initializer = __import("./ViewModel/Initializer.js"),
  Reflecter = __import("./Shared/Reflecter.js"),
) => {
  __exports[__DEFAULT__] = class Context {
    #parentElement;
    #rootElement;
    #container;
    #view;
    #viewModel;
    #viewBuilder;
    #viewUpdater;
    #bindRules = [];
    #dependencyRules = [];
    #dependencies;
    #bindTree = { binds:[], loops:[] }
    #allBinds = [];
    #allLoops = [];
    #loopStack = [];
    #indexesStack = [];
    #properties;
    #notifier;
    #cache;
    #template;
    #module;
    #filter;
    #rootBlock;
    #block;
    #eventHandler;
    #initializer;
    #data;
    #dataReflecter;
  
    constructor(block, parentElement) { 
      this.#block = block;
      this.#parentElement = parentElement;
    }
  
    build() {
      const App = __import("./App.js");
      this.#container = ViewContainer.create(this);
      this.#view = this.#container.view;
      this.#viewBuilder = ViewBuilder;
      this.#viewUpdater = this.#container.viewUpdater;
      this.#dependencies = this.#container.dependencies;
      this.#properties = this.#container.properties;
      this.#notifier = this.#container.notifier;
      this.#cache = this.#container.cache;
      this.#filter = App.filter;
      this.#rootBlock = App.root;
      this.#eventHandler = EventHandler;
      this.#initializer = Initializer;
      this.#data = App.data;
      this.#dataReflecter = Reflecter;
    }
  
    get parentElement() { return this.#parentElement; }
    get rootElement() { return this.#rootElement; }
    get container() { return this.#container; }
    get view() { return this.#view; }
    get viewModel() { return this.#viewModel; }
    get viewBuilder() { return this.#viewBuilder; }
    get viewUpdater() { return this.#viewUpdater; }
    get bindRules() { return this.#bindRules; }
    get dependencyRules() { return this.#dependencyRules; }
    get dependencies() { return this.#dependencies; }
    get bindTree() { return this.#bindTree; }
    get allBinds() { return this.#allBinds; }
    get allLoops() { return this.#allLoops; }
    get indexesStack() { return this.#indexesStack; }
    get indexes() { return this.#indexesStack[this.#indexesStack.length - 1]; }
    get $1() { return this.indexes[0]; }
    get $2() { return this.indexes[1]; }
    get $3() { return this.indexes[2]; }
    get $4() { return this.indexes[3]; }
    get $5() { return this.indexes[4]; }
    get $6() { return this.indexes[5]; }
    get $7() { return this.indexes[6]; }
    get $8() { return this.indexes[7]; }
    get loopStack() { return this.#loopStack; }
    get currentLoop() { return this.#loopStack[this.#loopStack.length - 1]; }
    get properties() { return this.#properties; }
    get notifier() { return this.#notifier; }
    get cache() { return this.#cache; }
    get context() { return this; }
    get template() { return this.#template; }
    get module() { return this.#module; }
    get filter() { return this.#filter; }
    get rootBlock() { return this.#rootBlock; }
    get block() { return this.#block; }
    get eventHandler() { return this.#eventHandler; }
    get initializer() { return this.#initializer; }
    get data() { return this.#data; }
    get dataReflecter() { return this.#dataReflecter; }
  
    set rootElement(v) { this.#rootElement = v; }
    set viewModel(v) { 
      this.#viewModel = v;
      const Container = this.#container.constructor;
      Container.regist(this.#container, "viewModel", this.#viewModel)
    }
    set template(v) { this.#template = v; }
    set module(v) { this.#module = v; }
  
    pushIndexes(indexes, callback) {
      this.#indexesStack.push(indexes);
      try {
        return callback();
      } finally {
        this.#indexesStack.pop();
      }
    }
    pushLoop({loop, key}, callback) {
      this.#loopStack.push({loop, key});
      try {
        return callback();
      } finally {
        this.#loopStack.pop();
      }
    }
    
    getPathInfo(
      property, 
      pattern = property, 
      loop = this.currentLoop?.loop, 
      key = this.currentLoop?.key, 
      indexes = this.indexes ?? []
    ) {
      return (property[0] === ".") ?
        (  // relative path
          (property === ".") 
          ? { path: `${loop.path}.${key}`, pattern: `${loop.pattern}.*` }
          : { path: `${loop.path}.${key}.${property}`, pattern: `${loop.pattern}.*.${property}` }
        )
        : { // absolute path
          path: PropertyName.expand(pattern, indexes),
          pattern: pattern,
        };
    }
  
    setBindTree({ binds, loops }, bindTree = this.bindTree) {
      bindTree.binds.splice(0);
      bindTree.loops.splice(0);
      bindTree.binds.push(...binds);
      bindTree.loops.push(...loops);
    }
  
    buildBinds(bindTree = this.bindTree, allBinds = this.allBinds, allLoops = this.allLoops) {
      allBinds.splice(0);
      allLoops.splice(0);
      const bindAppender = bind => allBinds.push(bind);
      const loopAppender = loop => allLoops.push(loop);
      bindTree.binds.forEach(bindAppender);
      bindTree.loops.forEach(loopAppender);
      const walk = loop => {
        loop.children.forEach(child => {
          child.binds.forEach(bindAppender);
          child.loops.forEach(loopAppender);
          child.loops.forEach(walk);
        });
      };
      bindTree.loops.forEach(walk);
    }
  
    reflect(object, dialog) {
      const proto = Object.getPrototypeOf(this);
      const context = this;
      Object.entries(Object.getOwnPropertyDescriptors(proto)).forEach(([key, desc]) => {
        if (desc?.get != null) {
          const reflectDesc = {
            configurable: true,
            enumerable: true,
            get: (...args) => Reflect.apply(desc.get, this, args)
          };
          Object.defineProperty(object, key, reflectDesc);
        }
      });
      [
        ["$notify", "notify"],
        ["$notifyAll", "notifyAll"],
        ["$inquiryAll", "inquiryAll"],
        ["$openDialog", "openDialog"],
        ["$postUpdate", "postUpdate"],
      ].forEach(([orgFunc, func]) => {
        const isAsync = orgFunc.constructor.name === "AsyncFunction";
        const value = isAsync 
          ? async (...args) => Reflect.apply(this[orgFunc], this, args)
          : (...args) => Reflect.apply(this[orgFunc], this, args);
        const desc = {
          configurable: true,
          enumerable: false,
          value,
        };
        Object.defineProperty(object, func, desc);
      });
      if (dialog != null) {
        this.$closeDialog = function (data) {
          dialog.closeDialog(data);
        };
        const descClose = {
          configurable: true,
          enumerable: false,
          value: (...args) => Reflect.apply(this.$closeDialog, this, args),
        };
        Object.defineProperty(object, "closeDialog", descClose);
  
        this.$cancelDialog = function () {
          dialog.cancelDialog();
        };
        const descCancel = {
          configurable: true,
          enumerable: false,
          value: (...args) => Reflect.apply(this.$cancelDialog, this, args),
        };
        Object.defineProperty(object, "cancelDialog", descCancel);
      }
    }
  
    $notify(pattern, indexes = []) {
      this.notifier.notify(pattern, indexes);
    }
    $postUpdate(callback) {
      this.viewUpdater.registPostProcess(callback);
    }
    async $notifyAll(pattern, indexes = []) {
      this.rootBlock.notifyAll(pattern, indexes, this.block);
    }
    async $inquiryAll(message, param1, param2) {
      this.$postUpdate(() => this.rootBlock.inquiryAll(message, param1, param2, this.block));    
    }
  
    async $openDialog(name, data = {}) {
      const Dialog = __import("./Dialog/Dialog.js");
      return Dialog.open(name, data);
    }
  
  }  
  return __exports;
});

__modules("./Bind/Rules.js", (
  __exports,
) => {
  const BIND_SELECTOR = "style[data-x\\:rules='bind']";
  const PREFIX_BIND = "--bind-";
  const PREFIX_CLASS = "--bind-class-";
  const KEY_EVENTS = "--events";
  const KEY_LOOP = "--loop";
  class BindRule {
    dom = { selector:"" };
    viewModel = { };
    filters = [];
  
    static createBind(selectorText, domProp, vmProp, filters) {
      const rule = new BindRule();
      rule.dom.selector = selectorText;
      rule.dom.property = domProp;
      rule.viewModel.property = vmProp;
      rule.filters.push(...filters);
      return rule;
    }
  
    static createEvent(selectorText, event) {
      const rule = new BindRule();
      rule.dom.selector = selectorText;
      rule.dom.event = event;
      return rule;
    }
  
    static createLoop(selectorText, vmProp) {
      const rule = new BindRule();
      rule.dom.selector = selectorText;
      rule.viewModel.property = vmProp;
      return rule;
    }
  
    static build(cssRule) {
      const rules = [];
      for(let i = 0; i < cssRule.style.length; i++) {
        const key = cssRule.style[i];
        const value = cssRule.style.getPropertyValue(key).trim();
        if (key === KEY_EVENTS) {
          for(const event of value.split(",")) {
            const eventRule = BindRule.createEvent(
              cssRule.selectorText,
              event
            );
            rules.push(eventRule);
          }
        } else if (key === KEY_LOOP) {
          const loopRule = BindRule.createLoop(
            cssRule.selectorText,
            value
          );
          rules.push(loopRule);
        } else if (key.startsWith(PREFIX_CLASS)) {
          const values = value.split("|");
          const vmProp = values.shift();
          const filters = values;
          const bindRule = BindRule.createBind(
            cssRule.selectorText,
            "class." + key.slice(PREFIX_CLASS.length),
            vmProp, 
            filters
          );
          rules.push(bindRule);
        } else if (key.startsWith(PREFIX_BIND)) {
          const values = value.split("|");
          const vmProp = values.shift();
          const filters = values;
          const bindRule = BindRule.createBind(
            cssRule.selectorText,
            key.slice(PREFIX_BIND.length).replaceAll("-", "."),
            vmProp, 
            filters
          );
          rules.push(bindRule);
        }
      }
      return rules;
    }
  }
  
  __exports[__DEFAULT__] = class Rules {
    static collect(rootElement) {
      const dummy = document.createElement("div");
      document.body.appendChild(dummy);
      const shadow = dummy.attachShadow({mode:"open"});
      const styleNode = rootElement.querySelector(BIND_SELECTOR);
      const rules = []
      if (styleNode != null) {
        shadow.appendChild(styleNode);
        const styleSheetFinder = sheet => sheet.ownerNode === styleNode;
        const styleSheet = Array.from(shadow.styleSheets).find(styleSheetFinder);
        Array.from(styleSheet?.cssRules ?? []).map(rule => rules.push(...BindRule.build(rule)));
      }
      document.body.removeChild(dummy);
      return rules;
    }
  
  }
  return __exports;
});

__modules("./View/Container.js", (
  __exports,
  Container = __import("./Container/Container.js"),
  View = __import("./View/View.js"),
  ViewUpdater = __import("./View/ViewUpdater.js"),
  Dependencies = __import("./ViewModel/Dependency.js"),
  Properties = __import("./ViewModel/Properties.js"),
  Notifier = __import("./View/Notifier.js"),
  Cache = __import("./ViewModel/Cache.js"),
) => {
  class ViewContainer extends Container {
    registData = [
      ["view", View, "context"],
      ["viewUpdater", ViewUpdater, "context"],
      ["dependencies", Dependencies, "context"],
      ["properties", Properties, "context"],
      ["notifier", Notifier, "context"],
      ["cache", Cache, "context"],
    ];
    static create(context) {
      const container = ViewContainer.registAll(new ViewContainer());
      ViewContainer.regist(container, "context", context);
      return container;
    }
  }
  
  __exports[__DEFAULT__] = ViewContainer;  
  return __exports;
});

__modules("./View/ViewBuilder.js", (
  __exports,
  Collect = __import("./Bind/Collect.js")
) => {
  __exports[__DEFAULT__] = class ViewBuilder {
    static build(context, rootElement, bindRules = context.bindRules) {
      const { loops, binds, events } = Collect.collect(context, rootElement, bindRules);
      loops.forEach(loop => loop.expand());
      binds.forEach(bind => bind.init());
      events.forEach(event => event.init());
      return { loops, binds, events };
    }
  
  }
  
  return __exports;
});

__modules("./Dialog/Dialog.js", (
  __exports,
  Block = __import("./Block/Block.js"),
) => {
  const DATA_DIALOG = "x:dialog"

  __exports[__DEFAULT__] = class Dialog {
    #block;
    #data;
    #name;
    #root;
    #fg;
    #bg;
    #resolve;
    #reject;
    constructor(name, data) {
      this.#name = name;
      this.#data = data;
    }
    get name() { return this.#name; }
    get data() { return this.#data; }
    get block() { return this.#block; }
    get root() { return this.#root; }

    createBackLayer(name = this.#name) {
      const root = document.createElement("div");
      root.dataset[DATA_DIALOG] = name;
    
      // background
      const bg = document.createElement("div");
      bg.style.position = "fixed";
      bg.style.display = "flex";
      bg.style.alignItems = "center";
      bg.style.justifyContent = "space-around";
      bg.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      bg.style.left = "0";
      bg.style.top = "0";
      bg.style.height = "100vh";
      bg.style.width = "100vw";
      bg.style.zIndex = "499";
      bg.classList.add("bg");
      bg.addEventListener("click", e => this.cancelDialog());
      root.appendChild(bg);
      
      // foreground
      const fg = document.createElement("div");
      fg.style.backgroundColor = "white";
      fg.style.borderRadius = ".375rem";
      fg.style.padding = "2rem";
      fg.classList.add("fg");
      fg.addEventListener("click", e => e.stopPropagation());
      bg.appendChild(fg);

      return { root, bg, fg };
    }
    
    async create(name = this.#name, data = this.#data) {
      const { root, bg, fg } = this.createBackLayer(name);

      const block = new Block(data, this);
      await block.load(name, fg);
      await block.build();
  //    block.context.attachDialog(this);

      document.body.appendChild(root);

      this.#block = block;
      this.#root = root;
    }

    cancelDialog() {
      this.#reject && this.#reject();
    }

    closeDialog(data) {
      this.#resolve && this.#resolve(data);
    }

    async main() {
      return new Promise((resolve, reject) => {
        this.#resolve = resolve;
        this.#reject = reject;
      }).finally(() => {
        this.#root.parentNode.removeChild(this.#root);
      });
    }

    static async open(name, data = {}) {
      const dialog = new Dialog(name, data);
      dialog.create();
      return dialog.main();
    }
  }

  return __exports;
});

__modules("./ViewModel/PropertyName.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class PropertyName {
    name;
    pattern;
    indexes;
    lastName;
    parentName;
    constructor({ name = null, pattern = null, indexes = null }) {
      this.name = name;
      this.pattern = pattern;
      this.indexes = indexes;
      if (name == null && pattern != null && indexes != null) {
        this.name = PropertyName.expand(pattern, indexes);
      }
      const elements = this.name.split(".");
      this.lastName = elements.pop();
      this.parentName = elements.join(".");
    }

    static expand(pattern, indexes, tmpIndexes = indexes.slice()) {
      const replacer = () => tmpIndexes.shift();
      return pattern.replaceAll("*", replacer);
    }

    static createByName(name) {
      return new PropertyName({ name });
    }

    static createByPatternIndexes(pattern, indexes) {
      return new PropertyName({ pattern, indexes });
    }
  }
  return __exports;
});

__modules("./ViewModel/EventHandler.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class EventHandler {
    static async exec(viewModel, name, ...args) {
      const propName = name[0].toUpperCase() + name.slice(1);
      const eventPrperty = `event${propName}`;
      const eventHandler = `on${propName}`;
      if (eventPrperty in viewModel) {
        const desc = Object.getOwnPropertyDescriptor(viewModel, eventPrperty);
        return Reflect.apply(desc.set, viewModel, [args]);
      } else if (eventHandler in viewModel) {
        return viewModel[eventHandler](...args);
      }
    }
  }  
  return __exports;
});

__modules("./ViewModel/Initializer.js", (
  __exports,
  eventHandler = __import("./ViewModel/EventHandler.js")
) => {
  const PREFIX_PRIVATE = "__";
  __exports[__DEFAULT__] = class Initializer {
    static async init(context, data, viewModel = context.viewModel, properties = context.properties) {
      const promises = [];
      for(const property of properties.values) {
        const assign = value => property.name.includes(".") ? (viewModel[property.name] = value) : (viewModel[`${PREFIX_PRIVATE}${property.name}`] = value);
        property?.init && (
          (property.init).constructor.name === "AsyncFunction" ?
            promises.push(property.init(data).then(value => assign(value))) : assign(property.init(data))
        );
      }
      await Promise.all(promises);
      return eventHandler.exec(viewModel, "init", data);
    }
  }
  return __exports;
});

__modules("./Shared/Reflecter.js", (
  __exports,
) => {
  const PREFIX_SHARED = "$";
  __exports[__DEFAULT__] = class Reflecter {
    static reflect(context, data, reflectData = {}) {
      Object.keys(data).forEach(name => {
        const sharedName = `${PREFIX_SHARED}${name}`;
        const notifyAll = result => (result !== false) && context.$postUpdate(() => {
          context.$notify(sharedName);
          context.$notifyAll(sharedName);
        });
        const desc = {
          configurable: false,
          enumerable: true,
          get: () => Reflect.get(data, name),
          set: value => {
            const result = Reflect.set(data, name, value);
            (result instanceof Promise) ? result.then(notifyAll) : notifyAll(result);
            return result;
          },
        };
        Object.defineProperty(reflectData, sharedName, desc);
      } );
    }
  }  
  return __exports;
});

__modules("./View/View.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class View {
    #context;
    constructor(context) {
      this.#context = context;
    }
  
    build(context = this.#context, builder = this.#context.viewBuilder, rootElement = this.#context.rootElement) {
      const info = builder.build(context, rootElement);
      context.setBindTree(info);
      context.buildBinds();
    }
  
    appear(context = this.#context) {
      const shadow = context.parentElement.attachShadow({mode: 'open'});
      shadow.appendChild(context.rootElement);
      context.rootElement = shadow;
    }
  }
  return __exports;
});

__modules("./View/ViewUpdater.js", (
  __exports,
  PropertyName = __import("./ViewModel/PropertyName.js")
) => {
  __exports[__DEFAULT__] = class ViewUpdator {
    #context;
    #processQueue = [];
    constructor(context) {
      this.#context = context;
    }
  
    registPostProcess(callback) {
      this.#processQueue.push(callback);
    }
  
    async postProcess() {
      const processes = this.#processQueue.slice();
      if (processes.length > 0) {
        this.updateProcess(async () => {
          for(const procsess of processes) {
            procsess();
          }
        });
      }
    }
  
    clearPostProcess() {
      this.#processQueue.splice(0);
    }
  
    updateDom(
      notifier = this.#context.notifier, 
      allBinds = this.#context.allBinds, 
      allLoops = this.#context.allLoops, 
      dependencies = this.#context.dependencies
    ) {
      const updatePaths = [];
      const conv = ({name, indexes}) => ({ name: PropertyName.expand(name, indexes), pattern:name, indexes });
      const getUpdatePaths = ({name, indexes}) => updatePaths.push(...dependencies.getReferedProperties(name, indexes), conv({name, indexes}));
      notifier.queue.forEach(getUpdatePaths);
      const setOfUpdatePaths = new Set(updatePaths.map(info => info.name));
  
      const updateLoop = loop => loop.update();
      allLoops.filter(loop => setOfUpdatePaths.has(loop.path)).forEach(updateLoop);
  
      const updateBind = bind => bind.updateDom();
      allBinds.filter(bind => setOfUpdatePaths.has(bind.path)).forEach(updateBind);
    }
  
    async updateProcess(
      updateCallback, 
      context = this.#context, 
      notifier = this.#context.notifier, 
      properties = this.#context.properties
    ) {
  //    console.log(`${context.block.name} updateProcess`);
      this.clearPostProcess();
      notifier.clear();
      properties.clearStatus();
  
      await updateCallback();
  //    console.log("call updateDom()");
  
      this.updateDom();
      properties.isUpdate && context.buildBinds();
  
      await this.postProcess();
    }
  } 
  return __exports;
});

__modules("./ViewModel/Dependency.js", (
  __exports,
  PropertyName = __import("./ViewModel/PropertyName.js")
) => {
  class DepNode {
    parentNodes = [];
    name;
    func;
    childNodes = [];
    constructor(name) {
      this.name = name;
    }
  }
  
  __exports[__DEFAULT__] = class Dependencies {
    #map = new Map;
    #dependencyRules;
    #context;
    constructor(context) {
      this.#context = context;
    }
  
    build(map = this.#map, dependencyRules = this.#context.dependencyRules) {
      map.clear();
      this.#dependencyRules = this.#context.dependencyRules.slice();
      dependencyRules.forEach(([ property, refProperties, func ]) => this.add(map, property, refProperties, func));
    }
  
    add(map, property, refProperties, func) {
      map.has(property) || map.set(property, new DepNode(property));
      const node = map.get(property);
      node.func = func;
      refProperties.forEach(refProperty => {
        map.has(refProperty) || map.set(refProperty, new DepNode(refProperty));
        const refNode = map.get(refProperty);
        node.childNodes.push(refNode);
        refNode.parentNodes.push(node);
      });
    }
  
    getReferedProperties(property, indexes, map = this.#map) {
      const node = map.get(property);
      const walk = (node, list) => {
        if (node == null) return list;
        list.push({
          name: PropertyName.expand(node.name, indexes ?? []),
          pattern: node.name,
          indexes: node.func ? node.func(indexes) : indexes
        });
        node.parentNodes.forEach(parentNode => {
          list = walk(parentNode, list);
        });
        return list;
      };
      const list = walk(node, []);
      const newList = [];
      list.forEach(info => {
        const setOfNames = new Set(newList.map(info => info.name));
        if (setOfNames.has(info)) return;
        newList.push(info);
      });
      return newList;
    }
  
  }  
  return __exports;
});

__modules("./ViewModel/Properties.js", (
  __exports,
  PropertyName = __import("./ViewModel/PropertyName.js"),
  PropertyType = __import("./ViewModel/Property.js", "PropertyType"),
  Property = __import("./ViewModel/Property.js", "Property")
) => {
  const NOT_FOUND = `property "%name%" is not found `;
  const PREFIX_PRIVATE = "__";
  __exports[__DEFAULT__] = class Properties {
    #context;
    #propertyByName = new Map;
    #isUpdate = false;
    constructor(context) {
      this.#context = context;
    }
    get names() {
      return Array.from(this.#propertyByName.keys());
    }
    get values() {
      return Array.from(this.#propertyByName.values());
    }
  
    build(context = this.#context, viewModel = this.#context.viewModel) {
      this.#propertyByName.clear();
      const proto = Object.getPrototypeOf(viewModel);
  
      // "aaa", "aaa.bbb", "aaa.*.bbb"
      const toPrivateDesc = desc => ({configurable: true, enumerable: false, writable: true, value: desc?.value});
      const isPropertyName = name => /^\@\@?([a-zA-Z0-9_\.\*])+(#(get|set|init))?$/.test(name);
      const isEventName = name => /^#(event[a-zA-Z0-9_]+)$/.test(name);
      const isPrivateName = name => /^__([a-zA-Z0-9_])+$/.test(name);
  
      const createInfo = () => ({
        baseName: null,
        originalName: null,
        privateName: null,
        get: null,
        set: null,
        init: null,
        requireGet: false,
        requireSet: false,
        privateValue: undefined,
      });
      const infoByBaseName = new Map();
      [viewModel].forEach(o => {
        Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
          if (!isPropertyName(name) && !isPrivateName(name) && !isEventName(name)) return;
          if (isPrivateName(name)) {
            Reflect.defineProperty(viewModel, name, toPrivateDesc(desc));
          } else if (isPropertyName(name))  {
            const [ originalName, method ] = name.includes("#") ? name.split("#") : [ name, null ];
            const requireSet = (name.at(1) === "@");
            const baseName = requireSet ? originalName.slice(2) : originalName.slice(1);
            const info = (infoByBaseName.has(baseName)) ? infoByBaseName.get(baseName) : createInfo();
            info.baseName = info.baseName ?? baseName;
            info.originalName = info.originalName ?? originalName;
            info.privateName = info.privateName ?? `${PREFIX_PRIVATE}${baseName}`;
            info.get = method === "get" ? desc.value : info.get;
            info.set = method === "set" ? desc.value : info.set;
            info.init = method === "init" ? desc.value : info.init;
            info.requireGet = (method == null) ? true : info.requireGet;
            info.requireSet = requireSet;
            info.privateValue = (method == null) ? desc.value : info.privateValue;
            infoByBaseName.set(baseName, info);
            Reflect.deleteProperty(viewModel, name);
          } else if (isEventName(name))  {
            const originalName = name;
            const method = "set";
            const requireSet = true;
            const baseName = originalName.slice(1);
            const info = (infoByBaseName.has(baseName)) ? infoByBaseName.get(baseName) : createInfo();
            info.baseName = info.baseName ?? baseName;
            info.originalName = info.originalName ?? originalName;
            info.privateName = info.privateName ?? `${PREFIX_PRIVATE}${baseName}`;
            info.set = method === "set" ? desc.value : info.set;
            info.requireGet = (method == null) ? true : info.requireGet;
            info.requireSet = requireSet;
            info.privateValue = (method == null) ? desc.value : info.privateValue;
            infoByBaseName.set(baseName, info);
            Reflect.deleteProperty(viewModel, name);
          }
        });
      });
  
      Array.from(infoByBaseName.entries()).forEach(([baseName, info]) => {
        // private property name
        if (!(info.privateName in viewModel) && !info.baseName.includes(".")) {
          Reflect.defineProperty(viewModel, info.privateName, toPrivateDesc({value:info.privateValue}));
        }
        const desc = Object.getOwnPropertyDescriptor(viewModel, baseName) ?? Object.getOwnPropertyDescriptor(proto, baseName) ?? {};
        desc.get = info.get != null ? info.get : (desc.get ?? null);
        desc.set = info.set != null ? info.set : (desc.set ?? null);
        const init = info.init;
        const requireSetter = info.requireSet;
        const name = baseName;
        this.setProperty(Property.create(context, {name, desc, requireSetter, init}));
      });
  
      // accessor property set enumerable 
      [viewModel, proto].forEach(o => {
        Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
          if (this.#propertyByName.has(name)) return;
          if (desc?.get != null) {
            this.setProperty(Property.create(context, {name, desc, requireSetter:desc?.set != null}));
          } else if (desc?.set != null) {
            this.setProperty(Property.create(context, {name, desc, requireSetter:true}));
          }
        });
      });
  
      // complement ?
      const requiredPropertiesAll = [];
      for(const name of this.#propertyByName.keys()) {
        const properties = [];
        const names = name.split(".");
        const elements = [];
        names.forEach(element => {
          elements.push(element);
          properties.push(elements.join("."));
        });
        requiredPropertiesAll.push(...properties);
      }
      const noExists = requiredProperty => !this.#propertyByName.has(requiredProperty)
      const requiredProperties = Array.from(new Set(requiredPropertiesAll)).filter(noExists);
      requiredProperties.forEach(name => {
        const defineDesc = Object.getOwnPropertyDescriptor(viewModel, name) ?? Object.getOwnPropertyDescriptor(proto, name) ?? {};
        this.setProperty(Property.create(context, {name:name, desc:defineDesc, requireSetter:true}));
      });
  
      Object.defineProperty(viewModel, "$context", {
        get: () => context,
      });
    }
  
    removeProperty(name, object = this.#context.viewModel, cache = this.#context.cache, propertyByName = this.#propertyByName) {
      delete object[name];
      propertyByName.delete(name);
      cache.delete(name);
    }
  
    getProperty(name, propertyByName = this.#propertyByName) {
      return propertyByName.get(name);
    }
  
    setProperty(property, propertyByName = this.#propertyByName) {
      propertyByName.set(property.name, property);
    }
  
    #expand(property) {
      const indexes = (property.type === PropertyType.EXPANDED) ? property.patternIndexes : [];
      const value = property.value;
      const context = this.#context;
      property.referedPatternProperties.forEach(patternProperty => {
        const pattern = patternProperty.pattern;
        (Object.keys(value) ?? []).forEach(key => {
          const patternIndexes = indexes.concat(key);
          const path = PropertyName.expand(pattern, patternIndexes);
          if (!path.includes("*")) {
            const expandedProperty = Property.create(context, {patternProperty, patternIndexes, requireSetter:patternProperty.hasSetter });
            this.setProperty(expandedProperty);
            if (patternProperty.isArray) {
              this.#expand(expandedProperty);
            }
          }
        });
      });
    }
  
    expand(name, indexes = null) {
      const property = this.getProperty(name);
      property != null && this.#expand(property);
    }
  
    #contract(property) {
      const indexesKey = ((property.type === PropertyType.EXPANDED) ? property.patternIndexes : []).join("\t");
      const filterIndexes = property => property.patternIndexes.join("\t").startsWith(indexesKey);
      property.referedPatternProperties.forEach(patternProperty => {
        this.getExpandedPropertiesByPatternProperty(patternProperty).filter(filterIndexes).forEach(removeProperty => {
          this.removeProperty(removeProperty.name);
        });
      });
  
    }
  
    contract(name) {
      const property = this.getProperty(name);
      property != null && this.#contract(property);
    }
  
    testIsArray(name, propertyByName = this.#propertyByName) {
      return propertyByName.has(`${name}.*`);
    }
  
    #update(name, cache = this.#context.cache) {
      cache.delete(name);
      const property = this.getProperty(name);
      if (property != null && property.isArray) {
        this.#contract(property);
        this.#expand(property);
      }
    }
  
    updateByName(name, cache = this.#context.cache) {
      this.#update(name);
  
      const updateInfos = this.#context.dependencies.getReferedProperties(name);
      updateInfos.forEach(info => (name != info.name) && this.#update(info.name));
    }
  
    updateByPatternIndexes({ name, indexes }) {
      const propName = PropertyName.expand(name, indexes);
      this.updateByName(propName);
    }
  
    expandAll(propertyByName = this.#propertyByName) {
      Array.from(propertyByName.entries()).forEach(([key, property]) => {
        if (!key.includes("*") && property.isArray) {
          this.#expand(property);
        }
      });
    }
  
    has(name, propertyByName = this.#propertyByName) {
      return propertyByName.has(name);
    }
  
    getReferedPatternPeoperties(name) {
      const searchPattern = `${name}.`;
      const search = name => name.startsWith(searchPattern);
      const mapper = name => this.getProperty(name);
      const typeFilter = property => property.type === PropertyType.PATTERN;
      return this.names.filter(search).map(mapper).filter(typeFilter);
    }
  
    getExpandedPropertiesByPatternProperty(patternProperty) {
      const typeFilter = property => property.type === PropertyType.EXPANDED;
      const parentFilter = property => property.patternProperty === patternProperty;
      return this.values.filter(typeFilter).filter(parentFilter);
    }
  
    clearStatus() {
      return this.values.forEach(property => property.clearStatus());
    }
  
    get isUpdate() { 
      return this.values.some(property => property.isUpdate || property.isNew);
    }
  }

  return __exports;
});

__modules("./View/Notifier.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class Notifier {
    #queue = [];
    #context;
    constructor(context) {
      this.#context = context;
    }
    get queue() { return this.#queue; }
    
    notify(name, indexes = []) {
      this.#queue.push({name, indexes});
      this.#context.properties.updateByPatternIndexes({name, indexes});
    }
  
    clear() {
      this.#queue.splice(0);
    }
  }  
  return __exports;
});

__modules("./ViewModel/Cache.js", (
  __exports,
) => {
  __exports[__DEFAULT__] = class Cache {
    #cache = new Map;
    #context;
    constructor(context) {
      this.#context = context;
    }
  
    has(name) {
      return this.#cache.has(name);
    }
  
    get(name) {
      //console.log(`cache read "${name}"`);
      return this.#cache.get(name);
    }
  
    set(name, value) {
      this.#cache.set(name, value);
      return value;
    }
  
    delete(name) {
      this.#cache.delete(name);
    }
  }
  return __exports;
});

__modules("./Bind/Collect.js", (
  __exports,
  Bind = __import("./Bind/Bind.js"),
  Loop = __import("./Bind/Loop.js"),
  Event = __import("./Bind/Event.js"),
) => {
  const NOT_PROCESSING = ":not([data-x\\:processed])";
  const DATA_PROCESSING = "x:processing";
  const DATA_PROCESSED = "x:processed";
  const DATA_IGNORE = "x:ignore";
  const DATA_BIND = "x:bind";
  const DATA_LOOP = "x:loop";
  const DATA_EVENTS = "x:events";
  
  const SELECTOR_BIND = "[data-x\\:bind]";
  const SELECTOR_LOOP = "[data-x\\:loop]";
  const SELECTOR_EVENTS = "[data-x\\:events]";
  const SELECTOR_PROCESSING = "[data-x\\:processing]";
  const SELECTOR_ATTRIBUTE 
    = [SELECTOR_BIND, SELECTOR_LOOP, SELECTOR_EVENTS].map(selector => `${selector}${NOT_PROCESSING}`).join(",");
  const SELECTOR_IMPLICIT
    = ["input", "textarea", "select", "button"].map(selector => `${selector}${NOT_PROCESSING}`).join(",");
  
    __exports[__DEFAULT__] = class Collect {
    static inputable(element) {
      return (element.tagName === "INPUT" && element.type !== "button") || element.tagName === "TEXTAREA" || element.tagName === "SELECT";
    }
  
    static testRadio(element) {
      return (element.tagName === "INPUT" && element.type === "radio");
    }
  
    static testCheckbox(element) {
      return (element.tagName === "INPUT" && element.type === "checkbox");
    }
  
    static parsePropertyName(name) {
      const names = name.split("|");
      return {
        property: names.shift(),
        filters: names
      }
    }
  
    static parseDataBind(
      element, 
      value, 
      isInputable = this.inputable(element), 
      isRadio = this.testRadio(element), 
      isCheckbox = this.testCheckbox(element)
    ) {
      const assignRule = (value, rule) => {
        if (value.includes("=")) {
          const [domProperty, viewModelProperty] = value.split("=");
          const { property, filters } = this.parsePropertyName(viewModelProperty);
          rule.dom.property = domProperty;
          rule.viewModel.property = property;
          rule.filters = filters;
          const defaultProperty = isInputable ? (isRadio ? "radio" : isCheckbox ? "checkbox" : "value") : "";
          rule.inputable = defaultProperty === domProperty;
        } else {
          const { property, filters } = this.parsePropertyName(value);
          rule.dom.property = isInputable ? (isRadio ? "radio" : isCheckbox ? "checkbox" : "value") : "textContent";
          rule.viewModel.property = property;
          rule.filters = filters;
          rule.inputable = isInputable;
        }
        return rule;
      }
      const values = value.split(",");
      if (values.length == 1) {
        const rule = {dom:{}, viewModel:{}, filters:[]};
        return [assignRule(value, rule)];
      } else {
        const rules = values.map(value => {
          const rule = {dom:{}, viewModel:{}, filters:[]};
          return assignRule(value, rule);
  /*
          const [domProperty, vmProperty] = s.split("=");
          const { property, filters } = this.parsePropertyName(vmProperty);
          return { dom:{ property:domProperty }, viewModel:{ property: property }, filters };
  */
        });
        return rules;
      }
    }
  
    static collectByAttribute(context, rootElement, binds = [], loops = [], events = []) {
      Array.from(rootElement.querySelectorAll(SELECTOR_ATTRIBUTE)).forEach(element => {
        if (DATA_IGNORE in element.dataset) return;
        const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
        if (DATA_LOOP in element.dataset) {
          // <template data-loop="viewModelProperty">
          // template tag only
          if (element.tagName !== "TEMPLATE") return;
          if (processings.includes("loop")) return;
          const property = element.dataset[DATA_LOOP];
          const rule = {dom:{}, viewModel:{ property }, filters:[]};
          loops.push(new Loop(element, rule, context));
          processings.push("loop");
        } else {
          if (DATA_BIND in element.dataset) {
            if (processings.includes("bind")) return;
            binds.push(...this.parseDataBind(element, element.dataset[DATA_BIND]).map(rule => new Bind(element, rule, context)));
            processings.push("bind");
          } 
          if (DATA_EVENTS in element.dataset) {
            if (processings.includes("events")) return;
            // <div data-events="click,dblclick">
            element.dataset[DATA_EVENTS].split(",").forEach(event => {
              const rule = {dom:{ event }, viewModel:{}, filters:[]};
              events.push(new Event(element, rule, context));
            });
            processings.push("events");
          }
    
        } 
        element.dataset[DATA_PROCESSING] = processings.join(",");
      });
      return { binds, loops, events };
    }
  
    static collectByImplicit(context, rootElement, binds = [], loops = [], events = []) {
      Array.from(rootElement.querySelectorAll(SELECTOR_IMPLICIT)).forEach(element => {
        if (DATA_IGNORE in element.dataset) return;
        const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
        const isRadio = this.testRadio(element);
        const isCheckbox = this.testCheckbox(element);
        const rule = {dom:{}, viewModel:{}, filters:[]};
        if (element.tagName === "BUTTON" || (element.tagName === "INPUT" && element.type === "button")) {
          if (processings.includes("events")) return;
          rule.dom.event = "click";
          events.push(new Event(element, rule, context));
          processings.push("events");
        } else {
          if (processings.includes("bind")) return;
          const { property, filters } = this.parsePropertyName(element.name);
          rule.dom.property = isRadio ? "radio" : isCheckbox ? "checkbox" : "value";
          rule.viewModel.property = property;
          rule.filters = filters;
          rule.inputable = true;
          binds.push(new Bind(element, rule, context))
          processings.push("bind");
        }
        element.dataset[DATA_PROCESSING] = processings.join(",");
      });
      return { binds, loops, events };
    }
  
    static collectByRule(context, rootElement, bindRules, binds = [], loops = [], events = []) {
      const createLoop = (bindRule, element) => loops.push(new Loop(element, bindRule, context));
      const createBind = (bindRule, element) => binds.push(new Bind(element, bindRule, context));
      const createEvent = (bindRule, element) => events.push(new Event(element, bindRule, context));
      const rulesBySelector = new Map();
      bindRules.forEach(rule => {
        !rulesBySelector.has(rule.dom.selector) && rulesBySelector.set(rule.dom.selector, []);
        rulesBySelector.get(rule.dom.selector).push(rule);
      });
      Array.from(rulesBySelector.keys()).forEach(selector => {
        rootElement.querySelectorAll(`${selector}${NOT_PROCESSING}`).forEach(element => {
          if (DATA_IGNORE in element.dataset) return;
          const isInputable = this.inputable(element);
          const processings = element.dataset[DATA_PROCESSING]?.split(",") ?? [];
          const newProcessing = processings.slice();
          rulesBySelector.get(selector).forEach(bindRule => {
            const cloneRule = JSON.parse(JSON.stringify(bindRule));
            if (element.tagName === "TEMPLATE") {
              if (processings.includes("loop")) return;
              createLoop(cloneRule, element);
              newProcessing.push("loop");
            } else if ("event" in cloneRule.dom) {
              if (processings.includes("events")) return;
              createEvent(cloneRule, element);
              newProcessing.push("events");
            } else {
              if (processings.includes("bind")) return;
              cloneRule.inputable = isInputable;
              createBind(cloneRule, element);
              newProcessing.push("bind");
            }
          });
          element.dataset[DATA_PROCESSING] = newProcessing.join(",");
        });
      });
      return { loops, binds, events };
    }
    static collect(context, rootElement, bindRules = []) {
      const binds = [], loops = [], events = [];
      this.collectByRule(context, rootElement, bindRules, binds, loops, events);
      this.collectByAttribute(context, rootElement, binds, loops, events);
      this.collectByImplicit(context, rootElement, binds, loops, events);
      binds.forEach(bind => bind.dom.dataset[DATA_PROCESSED] = "");
      loops.forEach(loop => loop.dom.dataset[DATA_PROCESSED] = "");
      events.forEach(event => event.dom.dataset[DATA_PROCESSED] = "");
      Array.from(rootElement.querySelectorAll(SELECTOR_PROCESSING)).forEach(element => {
        element.removeAttribute(`data-${DATA_PROCESSING}`);
      })
      return { loops, binds, events };
    }
  }
  return __exports;
});

__modules("./ViewModel/Property.js", (
  __exports,
  PropertyName = __import("./ViewModel/PropertyName.js"),
) => {
  const PREFIX_PRIVATE = "__";
  const PropertyType = __exports["PropertyType"] = class PropertyType {
    static PLAIN = 1;
    static PATTERN = 2;
    static EXPANDED = 3;
  }
  
  const Property = __exports["Property"] = class Property {
    #name;
    #pattern;
    #pathLastElement;
    #pathParent;
    #context;
    #desc;
    #init;
    #type;
    #isNew = true;
    #isUpdate = false;
    #propName;
    constructor(context, type, name, pattern, desc, init) {
      this.#context = context;
      this.#type = type;
      this.#name = name;
      this.#pattern = pattern;
      this.#desc = desc;
      this.#init = init;
      const elements = name.split(".");
      this.#pathLastElement = elements.pop();
      this.#pathParent = elements.join(".");
    }
    get context() {
      return this.#context;
    }
    get name() {
      return this.#name;
    }
    get pathParent() {
      return this.#pathParent;
    }
    get pathLastElement() {
      return this.#pathLastElement;
    }
    get desc() {
      return this.#desc;
    }
    get init() {
      return this.#init;
    }
    get type() {
      return this.#type;
    }
    get pattern() {
      return this.#pattern;
    }
    get isArray() {
      return this.testIsArray();
    }
    get referedPatternProperties() {
      return this.getReferedPatternPeoperties();
    }
    get value() {
      return this.getValue();
    }
    get isNew() {
      return this.#isNew;
    }
    get isUpdate() {
      return this.#isUpdate;
    }
    get hasSetter() {
      return this.desc.set != null;
    }
    set desc(v) {
      this.#desc = v;
      Object.defineProperty(this.#context.viewModel, this.#name, v);
    }
    set isNew(v) {
      this.#isNew = v;
    }
    set isUpdate(v) {
      this.#isUpdate = v;
    }
    testIsArray() { return false; }
    getReferedPatternPeoperties() { return []; }
    getValue() { throw new Error(''); }
    clearStatus() {
      this.isNew = false;
      this.isUpdate = false;
    }
  
    static create(context, { name = null, desc = {}, patternProperty = null, patternIndexes = [], requireSetter = null, init = null }) {
      if (patternProperty != null) {
        return new ExpandedProperty(context, patternProperty, patternIndexes);
      } else {
        if (requireSetter === null) {
          requireSetter = ("set" in desc);
        }
        if (name.includes("*")) {
          return new PatternProperty(context, name, desc, requireSetter, init);
        } else {
          return new PlainProperty(context, name, desc, requireSetter, init);
        }
      }
    } 
    
  }
  
  // path not include "*"
  const PlainProperty = __exports["PlainProperty"] = class PlainProperty extends Property {
    constructor(context, name, desc, requireSetter, init) {
      super(context, PropertyType.PLAIN, name, name, desc, init);
      this.#buildDesc(requireSetter);
      this.#addNotifiable();
    }
    testIsArray(name = this.name, properties = this.context.properties) {
      return properties.testIsArray(name);
    }
    #buildDesc(requireSetter) {
      const viewModel = this.context.viewModel;
      const cache = this.context.cache;
      const pathParent = this.pathParent;
      const pathLastElement = this.pathLastElement;
      const hasParent = this.name.includes(".");
      const privateName = `${PREFIX_PRIVATE}${this.name}`;
      const name = this.name;
      const getter = hasParent 
        ? function() { 
          return cache.has(name) ? cache.get(name) : cache.set(name, this[pathParent]?.[pathLastElement]);
        } 
        : function() { 
          return cache.has(name) ? cache.get(name) : cache.set(name, this[privateName]);
        };
      const setter = hasParent 
        ? function(v) { this[pathParent][pathLastElement] = v; cache.delete(name); } 
        : function(v) { this[privateName] = v; this.isUpdate = true; cache.delete(name); };
      const desc = this.desc;
      const defaultDesc = {
        configurable: true,
        enumerable: true,
        get: desc.get ? desc.get : getter,
      };
      if (requireSetter) {
        defaultDesc.set = desc.set ? desc.set : setter;
      }
      this.desc = defaultDesc;
    }
    #addNotifiable() {
      const notifier = this.context.notifier;
      const properties = this.context.properties;
      const setter = this.desc.set;
      const desc = this.desc;
      const name = this.name;
      if (desc.set != null) {
        desc.set = async function(v) {
          const result = Reflect.apply(setter, this, [v]);
          const notify = (value) => (value !== false) && notifier.notify(name);
          (result instanceof Promise) ? result.then(notify) : notify(result);
          return result;       
        };
        this.desc = desc;
      }
    }
    getReferedPatternPeoperties(properties = this.context.properties, name = this.name) {
      return properties.getReferedPatternPeoperties(name);
    }
    getValue() {
      return Reflect.apply(this.desc.get, this.context.viewModel, [this.name]);
    }
  }
  
  // path include "*"
  const PatternProperty = __exports["PatternProperty"] = class PatternProperty extends Property {
    constructor(context, pattern, desc, requireSetter, init) {
      super(context, PropertyType.PATTERN, pattern, pattern, desc);
      this.#buildDesc(requireSetter);
    }
    testIsArray(pattern = this.pattern, properties = this.context.properties) {
      return properties.testIsArray(pattern);
    }
    #buildDesc(requireSetter) {
      const context = this.context;
      const viewModel = this.context.viewModel;
      const pathParent = this.pathParent;
      const pathLastElement = this.pathLastElement;
      const loopLevel = this.pattern.split("").filter(c => c === "*").length;
      const getter = function() {
        const indexes = context?.indexes ?? [];
        const prop = (pathLastElement === "*") ? indexes.at(loopLevel - 1) : pathLastElement;
        return this[pathParent]?.[prop];
      };
      const setter = function(v) {
        const indexes = context?.indexes ?? [];
        const prop = (pathLastElement === "*") ? indexes.at(loopLevel - 1) : pathLastElement;
        this[pathParent][prop] = v;
        this.isUpdate = true;
      };
      const desc = this.desc;
      const defaultDesc = {
        configurable: true,
        enumerable: true,
        get: desc.get ? desc.get : getter,
      };
      if (requireSetter) {
        defaultDesc.set = desc.set ? desc.set : setter;
      }
      this.desc = defaultDesc;
  
    }
    getReferedPatternPeoperties(properties = this.context.properties, pattern = this.pattern) {
      return properties.getReferedPatternPeoperties(pattern);
    }
  }
  
  // expanded
  const ExpandedProperty = __exports["ExpandedProperty"] = class ExpandedProperty extends Property {
    #patternProperty;
    #patternIndexes;
    constructor(context, patternProperty, patternIndexes) {
      const name = PropertyName.expand(patternProperty.pattern, patternIndexes);
      super(context, PropertyType.EXPANDED, name, patternProperty.pattern, null, patternProperty.init);
      this.#patternProperty = patternProperty;
      this.#patternIndexes = patternIndexes.slice();
      this.#buildDesc();
    }
    get patternProperty() {
      return this.#patternProperty;
    }
    get patternIndexes() {
      return this.#patternIndexes;
    }
    #buildDesc() {
      const context = this.context;
      const cache = this.context.cache;
      const viewModel = this.context.viewModel;
      const notifier = this.context.notifier;
      const properties = this.context.properties;
      const patternProperty = this.patternProperty;
      const patternIndexes = this.patternIndexes;
      const name = this.name;
      const desc = {};
      desc.configurable = true;
      desc.enumerable = true;
      desc.get = () => {
        const self = this;
        return context.pushIndexes(patternIndexes, () => {
          return cache.has(name) ? cache.get(name) : cache.set(name, viewModel[patternProperty.pattern]);
        });
      };
  
      if (patternProperty.desc.set != null) {
        desc.set = (v) => {
          const self = this;
          context.pushIndexes(patternIndexes, () => {
            viewModel[patternProperty.pattern] = v;
            notifier.notify(patternProperty.pattern, patternIndexes);
          });
        };
      }
      this.desc = desc;
    }
    testIsArray(pattern = this.patternProperty.pattern, properties = this.context.properties) {
      return properties.testIsArray(pattern);
    }
    getReferedPatternPeoperties(patternProperty = this.patternProperty) {
      return patternProperty.referedPatternProperties;
    }
    getValue() {
      return Reflect.apply(this.desc.get, this.context.viewModel, [this.name]);
    }
  }
  return __exports;
});

__modules("./Bind/Bind.js", (
  __exports,
  Filter = __import("./Bind/Filter.js")
) => {
  class DomPropertyType {
    static VALUE = 1;
    static CLASS = 2;
    static RADIO = 3;
    static CHECKBOX = 4;
  
    static matchClass = "class.";
    static matchRadio = "radio";
    static matchCheckbox = "checkbox";
  
    static getType(property) {
      return (
        (property === this.matchRadio) ? this.RADIO
        : (property === this.matchCheckbox) ? this.CHECKBOX
        : (property.startsWith(this.matchClass)) ? this.CLASS
        : this.VALUE
      );
    }
  
    static updateDomByValueType(bind) {
      const properties = bind.domProperty.split(".");
      const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
      const walk = (props, o, name = props.shift()) => (props.length === 0) ? (o[name] = value) : walk(props, o[name]);
      walk(properties, bind.dom);
    }
  
    static updateDomByClassType(bind) {
      const className = bind.domProperty.slice(this.matchClass.length);
      const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
      value ? bind.dom.classList.add(className) : bind.dom.classList.remove(className);
    }
  
    static updateDomByRadioType(bind) {
      const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
      bind.dom.checked = (bind.dom.value == value);
    }
  
    static updateDomByCheckboxType(bind) {
      const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
      bind.dom.checked = (value ?? []).includes(bind.dom.value);
    }
  
    static updateViewModelByValueType(bind) {
      const properties = bind.domProperty.split(".");
      const walk = (props, o, name = props.shift()) => (props.length === 0) ? o[name] : walk(props, o[name]);
      bind.viewModel[bind.path] = bind.filter.backward(bind.backwardFilters, walk(properties, bind.dom));
    }
  
    static updateViewModelByClassType(bind) {
      const className = bind.domProperty.slice(this.matchClass.length);
      bind.viewModel[bind.path] = bind.dom.classList.contains(className);
    }
  
    static updateViewModelByRadioType(bind) {
      if (bind.dom.checked) {
        bind.viewModel[bind.path] = bind.dom.value;
      }
    }
  
    static updateViewModelByCheckboxType(bind) {
      const setOfValues = new Set(bind.viewModel[bind.path] ?? []);
      if (bind.dom.checked) {
        setOfValues.add(bind.dom.value);
      } else {
        setOfValues.delete(bind.dom.value);
      }
      bind.viewModel[bind.path] = Array.from(setOfValues);
    }
  
    static #updateDomProcs = {};
    static #updateViewModelProcs = {};
  
    static init() {
      this.#updateDomProcs[this.VALUE] = this.updateDomByValueType;
      this.#updateDomProcs[this.CLASS] = this.updateDomByClassType;
      this.#updateDomProcs[this.RADIO] = this.updateDomByRadioType;
      this.#updateDomProcs[this.CHECKBOX] = this.updateDomByCheckboxType;
  
      this.#updateViewModelProcs[this.VALUE] = this.updateViewModelByValueType;
      this.#updateViewModelProcs[this.CLASS] = this.updateViewModelByClassType;
      this.#updateViewModelProcs[this.RADIO] = this.updateViewModelByRadioType;
      this.#updateViewModelProcs[this.CHECKBOX] = this.updateViewModelByCheckboxType;
    }
  
    static updateDom(bind, type = bind.domPropertyType) {
      Reflect.apply(this.#updateDomProcs[type], this, [bind]);
    }
  
    static updateViewModel(bind, type = bind.domPropertyType) {
      Reflect.apply(this.#updateViewModelProcs[type], this, [bind]);
    }
  }
  
  __exports[__DEFAULT__] = class Bind {
    #context;
    #dom;
    #domProperty;
    #viewModel;
    #viewModelProperty;
    #inputable;
    #indexes;
    #path;
    #pattern;
    #domPropertyType;
    #forwardFilters;
    #backwardFilters;
    
    constructor(dom, rule, context) {
      this.#dom = dom;
      this.#domProperty = rule.dom?.property;
      this.#viewModel = context.viewModel;
      this.#viewModelProperty = rule.viewModel?.property;
      this.#inputable = rule.inputable;
      this.#forwardFilters = Filter.parse(rule?.filters.join("|")) ?? [];
      this.#backwardFilters = this.#forwardFilters.slice().reverse();
  
      this.#context = context;
      this.#indexes = context.indexes?.slice() ?? [];
      this.#domPropertyType = DomPropertyType.getType(this.#domProperty);
  
      //
      const { path, pattern } = context.getPathInfo(this.#viewModelProperty);
      this.#path = path;
      this.#pattern = pattern; 
    }
  
    get dom() { return this.#dom; }
    get domProperty() { return this.#domProperty }
    get viewModel() { return this.#viewModel; }
    get path() { return this.#path; }
    get pattern() { return this.#pattern; }
    get domPropertyType() { return this.#domPropertyType; } 
    get forwardFilters() { return this.#forwardFilters; }
    get backwardFilters() { return this.#backwardFilters; }
    get filter() { return this.#context.filter; }
  
    init(inputable = this.#inputable) {
      if (inputable) {
        this.attachEvent();
      }
      this.updateDom();
    }
  
    updateDom() {
      DomPropertyType.updateDom(this);
    }
  
    updateViewModel() {
      DomPropertyType.updateViewModel(this);
    }
    
    attachEvent(dom = this.#dom, viewUpdater = this.#context.viewUpdater) {
      const handler = e => viewUpdater.updateProcess(() => this.updateViewModel());
      dom.addEventListener("input", handler);
    }
  }
  
  DomPropertyType.init();  
  return __exports;
});

__modules("./Bind/Loop.js", (
  __exports,
) => {
  class LoopChild {
    nodes = [];
    loops;
    binds;
    key;
  }
  
  __exports[__DEFAULT__] = class Loop {
    #dom;
    #viewModel;
    #viewModelProperty;
    #children = [];
    #context;
    #path;
    #pattern;
    #loopStack;
  
    constructor(dom, rule, context) {
      this.#dom = dom;
      this.#viewModel = context.viewModel;
      this.#viewModelProperty = rule.viewModel?.property;
      this.#context = context;
      //
      const { path, pattern } = context.getPathInfo(this.#viewModelProperty);
      this.#path = path;
      this.#pattern = pattern;
      this.#loopStack = context.loopStack.slice();
    }
    get dom() { return this.#dom; }
    get viewModel() { return this.#viewModel; }
    get path() { return this.#path; }
    get pattern() { return this.#pattern; }
    get children() { return this.#children; }
    
    createChild(key, dom = this.#dom, context = this.#context) {
      return context.pushLoop({ loop:this, key }, () => {
        const indexes = context.loopStack.map(loop => loop.key);
        return context.pushIndexes(indexes, () => {
          const fragment = document.createDocumentFragment();
          const child = new LoopChild;
          child.key = key;
  
          const clone = dom.content.cloneNode(true);
  
          const info = context.viewBuilder.build(context, clone);
          child.binds = info.binds;
          child.loops = info.loops;
          fragment.appendChild(clone);
          Array.from(fragment.childNodes).forEach(node => child.nodes.push(node));
          return child;
        });
      });
    }
  
    expand() {
      Object.keys(this.viewModel[this.path]).forEach(key => {
        this.#children.push(this.createChild(key));
      });
  
      const fragment = document.createDocumentFragment();
      const appendNode = node => fragment.appendChild(node);
      const appendChildNodes = child => child.nodes.forEach(appendNode);
      this.#children.forEach(appendChildNodes);
      this.#dom.after(fragment);
    }
  
    restoreStack(callback) {
      const loopStack = this.#loopStack.slice();
      const walk = (stack) => {
        if (stack.length === 0) {
          return callback();
        }
        const loop = stack.pop();
        return context.pushLoop(loop, walk);
      };
      walk(loopStack);
    }
  
    removeChild(child) {
      const loopContractor = loop => loop.contract();
      const nodeRemover = node => node.parentNode.removeChild(node);
      child.loops.forEach(loopContractor);
      child.nodes.forEach(nodeRemover);
    }
  
    contract(children = this.#children) {
      children.forEach(child => this.removeChild(child));
      children.splice(0);
    }
  
    update() {
      const expand = () => this.expand();
      this.contract();
      this.restoreStack(expand);
    }
  }
  
  return __exports;
});

__modules("./Bind/Event.js", (
  __exports,
) => {
  const DATASET_NAME = "x:name";
  __exports[__DEFAULT__] = class Event {
    #dom;
    #context;
    #rule;
    #event;
    #indexes;
    #handlerName;
    #eventName;
  
    constructor(dom, rule, context) {
      this.#dom = dom;
      this.#rule = rule;
      this.#event = rule.dom?.event;
      this.#context =context;
      this.#indexes = context.indexes?.slice() ?? [];
      this.#handlerName = this.getHandlerName();
    }
    get event() { return this.#event; }
    get dom() { return this.#dom; }
    get handlerName() { return this.#handlerName; }
  
    init() {
      this.attachEvent();
    }
  
    getHandlerName() {
      const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
      const dom = this.#dom;
      const event = this.#event.toLowerCase();
      const domName = (DATASET_NAME in dom?.dataset) ? dom?.dataset[DATASET_NAME] : (dom?.name?.length > 0) ? dom.name : dom.tagName;
      return `${event}${toFirstUpper(domName.toLowerCase())}`;
    }
  
    async eventHandler(
      event, 
      viewModel = this.#context.viewModel, 
      eventHandler = this.#context.eventHandler,
      handlerName = this.handlerName, 
      indexes = this.#indexes,
      context = this.#context
    ) {
      return context.pushIndexes(indexes, async () => {
        const result = eventHandler.exec(viewModel, handlerName, event, ...indexes);
  //      console.log("end eventHandler");
        return result;
      });
    }
  
    attachEvent(dom = this.#dom, event = this.#event, viewUpdater = this.#context.viewUpdater) {
      const handler = e => viewUpdater.updateProcess(async () => await this.eventHandler(e));
      dom.addEventListener(event, handler);
    }
  }
  
  return __exports;
});

__modules("./Bind/Filter.js", (
  __exports,
  Filters = __import("./Filter/Filters.js")
) => {
  __exports[__DEFAULT__] = class Filter {
    static parse(string) {
      return (string.length == 0) ? [] : string.split("|")
        .map(filterExpr => filterExpr.split(":"))
        .map(([ name, optionDesc]) => ({ name, options:optionDesc?.split(";") ?? [], filter:Filters.filterByName.get(name) }));
    }
  }  
  return __exports;
});

/*
__modules("./path/module.js", (
  __exports,
) => {
  __exports[__DEFAULT__];
  return __exports;
});
*/
const App = __import("./App.js");
window.datax = App;
