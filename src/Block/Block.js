import Data from "../Data.js"
import Root from "../Root.js"
import Context from "../View/Context.js";
import Module from "./Module.js"

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
    context.properties.build();
    context.dependencies.build();
    context.dataReflecter.reflect(context, data, context.viewModel);

    await context.initializer.init(context, data);
    await context.properties.expandAll();
    await context.view.build(context);
    this.#blocks.push(...await BlockBuilder.build(context.rootElement, useModule, rootBlock));
    (!context.isBlockModule || context.parentElement != null) && context.view.appear(context);
    await context.postProcess.exec();
  }

  static async create({ 
    name, 
    parentElement = null, 
    useModule = false, 
    moduleData = null,
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
    const notifier = context.notifier;
    const viewModel = context.viewModel;
    const eventHandler = context.eventHandler;
    const view = context.view;
    const promises = [];
    (fromBlock !== this) && notifier.notify(new Promise(async (resolve, reject) => {
      const asyncResult = eventHandler.exec(viewModel, "notifyAll", pattern, indexes, fromBlock);
      (asyncResult instanceof Promise) && await asyncResult;
      resolve({name:pattern, indexes});
    }));
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
  }

  prepareUpdate() {
    const results = [];
    this.context.copyUpdateQueue();
    results.push(this.context.updateQueue.length > 0);
    for(const block of this.#blocks) {
      results.push(block.prepareUpdate());
    }
    return !results.every(result => result === false);
  }

  async updateDom() {
    const promises = [];
    promises.push(this.context.view.updateDom(this.context));
    for(const block of this.#blocks) {
      promises.push(block.updateDom());
    }
    return Promise.all(promises);
  }

  async postProcess() {
    const promises = [];
    promises.push(this.context.view.postProcess(this.context));
    for(const block of this.#blocks) {
      promises.push(block.postProcess());
    }
    return Promise.all(promises);
  }

  async inquiryAll(message, param1, param2, fromBlock) {
    const context = this.#context;
    const viewModel = context.viewModel;
    const eventHandler = context.eventHandler;
    const view = context.view;
    (fromBlock !== this) && view.updateProcess(
      context,
      async () => eventHandler.exec(viewModel, "inquiryAll", message, param1, param2, fromBlock)
    );
    const promises = [];
    for(const block of this.#blocks) {
      promises.push(block.inquiryAll(message, param1, param2, fromBlock));
    }
    await Promise.all(promises);
  }

  attachTo(element, context = this.#context, view = context.view) {
    view.attachTo(context, element);
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