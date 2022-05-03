import ViewContainer from "./Container.js"
import App from "../App.js"
import ViewBuilder from "./ViewBuilder.js"
import Dialog from "../Dialog/Dialog.js"
import PropertyName from "../ViewModel/PropertyName.js"
import EventHandler from "../ViewModel/EventHandler.js"
import Initializer from "../ViewModel/Initializer.js"

export default class Context {
  #parentElement;
  #rootElement;
  #container;
  #view;
  #viewModel;
  #viewBuilder;
  #viewUpdator;
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

  constructor(block, parentElement) { 
    this.#block = block;
    this.#parentElement = parentElement;
  }

  build() {
    this.#container = ViewContainer.create(this);
    this.#view = this.#container.view;
    this.#viewBuilder = ViewBuilder;
    this.#viewUpdator = this.#container.viewUpdator;
    this.#dependencies = this.#container.dependencies;
    this.#properties = this.#container.properties;
    this.#notifier = this.#container.notifier;
    this.#cache = this.#container.cache;
    this.#filter = App.filter;
    this.#rootBlock = App.root;
    this.#eventHandler = EventHandler;
    this.#initializer = Initializer;
  }

  get parentElement() { return this.#parentElement; }
  get rootElement() { return this.#rootElement; }
  get container() { return this.#container; }
  get view() { return this.#view; }
  get viewModel() { return this.#viewModel; }
  get viewBuilder() { return this.#viewBuilder; }
  get viewUpdator() { return this.#viewUpdator; }
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
  async $notifyAll(pattern, indexes = []) {
    this.rootBlock.notifyAll(pattern, indexes, this.block);
  }
  async $inquiryAll(message, param1, param2) {
    this.rootBlock.inquiryAll(message, param1, param2, this.block);
  }

  async $openDialog(name, data = {}) {
    return Dialog.open(name, data);
  }

}