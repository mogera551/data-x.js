import ViewContainer from "./Container.js"
import App from "../App.js"

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

  constructor(parentElement) { 
    this.#parentElement = parentElement;
  }

  build() {
    this.#container = ViewContainer.create(this);
    this.#view = this.#container.view;
    this.#viewBuilder = this.#container.viewBuilder;
    this.#viewUpdator = this.#container.viewUpdator;
    this.#dependencies = this.#container.dependencies;
    this.#properties = this.#container.properties;
    this.#notifier = this.#container.notifier;
    this.#cache = this.#container.cache;
    this.#filter = App.filter;
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
    indexes = this.indexes, 
    replaceIndexes = indexes?.slice()) {
    return (property[0] === ".") ?
      (  // relative path
        (property === ".") 
        ? { path: `${loop.path}.${key}`, pattern: `${loop.pattern}.*` }
        : { path: `${loop.path}.${key}.${property}`, pattern: `${loop.pattern}.*.${property}` }
      )
      : { // absolute path
        path: pattern.replaceAll("*", () => replaceIndexes.shift()),
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

  reflect(object) {
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
    ].forEach(([orgFunc, func]) => {
      const desc = {
        configurable: true,
        enumerable: false,
        value: (...args) => Reflect.apply(this[orgFunc], this, args),
      };
      Object.defineProperty(object, func, desc);
  
    })

  }

  $notify(...args) {
    this.context.notifier.notify(...args);
  }

}