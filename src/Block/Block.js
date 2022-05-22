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

  async load({name, parentElement, useModule, withBindCss, rootBlock}) {
    const context = this.#createContext(name, parentElement, rootBlock);
    try {
      const buildBlockModule = (name) => {
        const module = rootBlock.block.context.modules[name];
        return Module.build(name, module);
      };
      const module = (useModule && rootBlock?.block) ? buildBlockModule(name) : await Module.load({name, useModule, withBindCss})
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
    !context.isBlockModule && context.view.appear(context);
    await context.postProcess.exec();
  }

  static async create({ 
    name, 
    parentElement = null, 
    useModule = false, 
    withBindCss = false, 
    rootBlock = Root.root,
    data = rootBlock.data, 
    dialog = null
  }) {
    const block = new Block(dialog);
    await block.load({name, parentElement, useModule, withBindCss, rootBlock});
    await block.build({data, useModule, rootBlock });
    return block;
  }

  async notifyAll(pattern, indexes, fromBlock) {
    const context = this.#context;
    const notifier = context.notifier;
    const viewModel = context.viewModel;
    const eventHandler = context.eventHandler;
    const view = context.view;
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
    (fromBlock !== this) && view.updateProcess(
      context,
      async () => {
        const asyncResult = eventHandler.exec(viewModel, "notifyAll", pattern, indexes, fromBlock);
        const result = (asyncResult instanceof Promise) ? await asyncResult : asyncResult;
        notifier.notify(pattern, indexes);
        return result;
      }
    );
  }

  async inquiryAll(message, param1, param2, fromBlock) {
    const context = this.#context;
    const viewModel = context.viewModel;
    const eventHandler = context.eventHandler;
    const view = context.view;
    for(const block of this.#blocks) {
      block.inquiryAll(message, param1, param2, fromBlock);
    }
    (fromBlock !== this) && view.updateProcess(
      context,
      async () => eventHandler.exec(viewModel, "inquiryAll", message, param1, param2, fromBlock)
    );
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