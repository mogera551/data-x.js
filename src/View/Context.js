import Filters from "../Filter/Filters.js"
import Dialog from "../Dialog/Dialog.js"
import PropertyName from "../ViewModel/PropertyName.js"
import EventHandler from "../ViewModel/EventHandler.js"
import Initializer from "../ViewModel/Initializer.js"
import Reflecter from "../Shared/Reflecter.js"
import View from "./View.js";
import Dependencies from "../ViewModel/Dependency.js";
import Properties from "../ViewModel/Properties.js";
import Notifier from "./Notifier.js";
import Cache from "../ViewModel/Cache.js";
import PostProcess from "./PostProcess.js";
import sym from "../Symbols.js";

export default class Context {
  #parentElement;
  #fragment; // template clone
  #rootElement;
  #view;
  #viewModel;
  #postProcess;
  #dependencies;
  #bindTree = { binds:[], loops:[] }
  #allBinds = [];
  #allLoops = [];
  #loopStack = [];
  #indexesStack = [];
  #properties;
  #notifier;
  #cache;
  #filter;
  #rootBlock;
  #block;
  #eventHandler;
  #initializer;
  #dataReflecter;
  #module;
  #updateQueue = [];

  constructor(block, parentElement, rootBlock) { 
    this.#block = block;
    this.#parentElement = parentElement;
    this.#rootBlock = rootBlock;
  }

  build() {
    this.#view = View;
    this.#postProcess = new PostProcess(this);
    this.#dependencies = new Dependencies(this);
    this.#properties = new Properties(this);
    this.#notifier = new Notifier(this);
    this.#cache = new Cache(this);
    this.#filter = Filters;
    this.#eventHandler = EventHandler;
    this.#initializer = Initializer;
    this.#dataReflecter = Reflecter;
  }

  get parentElement() { return this.#parentElement; }
  get fragment() { return this.#fragment; }
  get rootElement() { return this.#rootElement ?? this.#fragment; }
  get view() { return this.#view; }
  get viewModel() { return this.#viewModel; }
  get postProcess() { return this.#postProcess; }
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
  get filter() { return this.#filter; }
  get rootBlock() { return this.#rootBlock; }
  get block() { return this.#block; }
  get eventHandler() { return this.#eventHandler; }
  get initializer() { return this.#initializer; }
  get data() { return this.#rootBlock.data; }
  get dataReflecter() { return this.#dataReflecter; }
  get template() { return this.#module.template; }
  get module() { return this.#module; }
  get moduleDatas() { return this.#module.moduleDatas; }
  get bindRules() { return this.#module.bindRules; }
  get dependencyRules() { return this.#module.dependencyRules; }
  get isBlockModule() { return this.#module.useModule; }
  get symbols() { return sym; }
  get updateQueue() { return this.#updateQueue; }

  set module(module) {
    this.#module = module;
    this.#viewModel = 
      module.viewModel !== undefined ? module.viewModel : 
      (module.AppViewModel !== undefined ? Reflect.construct(module.AppViewModel, []) : {});
    this.#fragment = module.template.content.cloneNode(true);
    const reflectContext = module?.context ?? module?._;
    (reflectContext != null) && this.reflect(reflectContext, module.dialog);
  }
  set rootElement(value) { this.#rootElement = value; }
  set parentElement(value) { this.#parentElement = value; }

  copyUpdateQueue() {
    this.#updateQueue = this.#notifier.dequeue();
  }

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
      ["$postProcess", "postProcess"],
      ["$updateProcess", "updateProcess"],
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

  $notify(name, indexes = []) {
    this.notifier.notify({name, indexes});
  }

  $postProcess(callback) {
    this.postProcess.regist(callback);
  }

  $notifyAll(pattern, indexes = []) {
    this.rootBlock.notifyAll(pattern, indexes, this.block);
  }

  async $updateProcess(callback) {
    this.rootBlock.updateProcess(callback);
  }

  $inquiryAll(message, param1, param2) {
    return this.$postProcess(() => this.rootBlock.inquiryAll(message, param1, param2, this.block));    
  }

  async $openDialog(name, data = {}) {
    return Dialog.open(name, data);
  }
}