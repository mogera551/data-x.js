import Data from "../Data.js"
import Root from "../Root.js"
import Context from "../View/Context.js";
import Module from "./Module.js"
import Modules from "../Modules.js"

export class Block {
  #name;
  #context;
  #blocks = [];
  #dialog;

  constructor(dialog = null) {
    this.#dialog = dialog;
  }

  get context() { return this.#context; }
  get name() { return this.#name; }

  #createContext(name, parentElement, rootBlock) {
    this.#name = name;
    this.#context = new Context(this, parentElement, rootBlock);
    this.#context.build();
    return this.#context;
  }

  async load({name, parentElement, useModule, moduleData, withBindCss, rootBlock}) {
    const context = this.#createContext(name, parentElement, rootBlock);
    try {
      const buildBlockModule = (name) => {
        const module = rootBlock.block.context.moduleDatas[name];
        return Module.build(name, module);
      };
      const module = (useModule && rootBlock?.block) ? buildBlockModule(name) : (
        moduleData != null ? Module.build(name, moduleData, useModule) : await Module.load({name, useModule, withBindCss})
      );
      useModule && (rootBlock.block ?? (rootBlock.block = this));
      module.dialog = this.#dialog;
      context.module = module;
    } catch(e) {
      throw e;
    }
  }

  async build({data, useModule, rootBlock, context = this.#context}) {
    context.properties = context.props.build(context);
    context.dependencies.build();
    context.dataReflecter.reflect(context, data, context.proxyViewModel);

    await context.initializer.init(context, data);
//    await context.properties.expandAll();
    await context.view.build(context);
    this.#blocks.push(...await BlockBuilder.build(context.rootElement, useModule, rootBlock));
    (!context.isBlockModule || context.parentElement != null) && context.view.appear(context);
    await context.processor.exec();
  }

  static async create({ 
    name, 
    parentElement = null, 
    useModule = false, 
    moduleData = Modules.get(name),
    withBindCss = false, 
    rootBlock = Root.root,
    data = rootBlock.data, 
    dialog = null
  }) {
    const block = new Block(dialog);
    await block.load({name, parentElement, useModule, moduleData, withBindCss, rootBlock});
    await block.build({data, useModule, rootBlock });
    return block;
  }

  notifyAll(pattern, indexes, fromBlock) {
    const context = this.#context;
    const cache = context.cache;
    const notifier = context.notifier;
    const proxyViewModel = context.proxyViewModel;
    const eventHandler = context.eventHandler;
    (fromBlock !== this) && context.processor.regist(() => 
      notifier.notify(new Promise(async (resolve, reject) => {
        cache.delete(pattern);
        const asyncResult = eventHandler.exec(proxyViewModel, "notifyAll", pattern, indexes, fromBlock);
        (asyncResult instanceof Promise) && await asyncResult;
        resolve({name:pattern, indexes});
      }))
    );
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
  }

  inquiryAll(message, param1, param2, fromBlock) {
    const context = this.#context;
    const proxyViewModel = context.proxyViewModel;
    const eventHandler = context.eventHandler;
    (fromBlock !== this) && context.processor.regist(() => eventHandler.exec(proxyViewModel, "inquiryAll", message, param1, param2, fromBlock));
    for(const block of this.#blocks) {
      block.inquiryAll(message, param1, param2, fromBlock);
    }
  }

  attachTo(element, context = this.#context, view = context.view) {
    view.attachTo(context, element);
  }

  start(context = this.#context, eventLoop = context.eventLoop) {
    eventLoop.start();
    for(const block of this.#blocks) {
      block.start();
    }
  }

  terminate(context = this.#context, eventLoop = context.eventLoop) {
    eventLoop.terminate();
    for(const block of this.#blocks) {
      block.terminate();
    }
  }
}

export class BlockBuilder {
  static async build(rootElement, useModule = false, rootBlock = Root.root) {
    const QUERY_BLOCK = "[data-x\\:block]";
    const DATASET_BLOCK = "x:block";
    const DATASET_WITH_BIND_CSS = "x:withBindCss"; // notice: camel case

    const collect = (rootElement) => Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
    const createBlock = async (parentElement) => {
      const name = parentElement.dataset[DATASET_BLOCK];
      const withBindCss = DATASET_WITH_BIND_CSS in parentElement.dataset;
      return Block.create({ name, parentElement, withBindCss, useModule, rootBlock });
    };
    return await Promise.all(collect(rootElement).map(element => createBlock(element)));
  }
}