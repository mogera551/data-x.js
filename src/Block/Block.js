import Data from "../Data.js"
import Context from "../View/Context.js";
import BlockLoader from "../Block/BlockLoader.js";
import Rules from "../Bind/Rules.js"

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
      const {template, module} = await BlockLoader.load(name, withBindCss);
  
      context.template = template;
      context.module = module;
      context.viewModel = 
        module.default?.viewModel ?? 
        (module.default?.AppViewModel != null ? Reflect.construct(module.default.AppViewModel, []) : {});
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

  async buildView(data = Data.data, context = this.#context) {
    context.properties.build();
    context.dependencies.build();
    context.dataReflecter.reflect(context, data, context.viewModel);

    const initializer = context.initializer;
    await initializer.init(context, data);
    context.properties.expandAll();
    context.view.build();
    this.#blocks.push(...await BlockBuilder.build(context.rootElement));
    context.view.appear();
  }

  static async build(name, parentElement, withBindCss, data = Data.data, dialog = null) {
    const block = new Block(dialog);
    await block.load(name, parentElement, withBindCss);
    await block.buildView(data);
    return block;
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

export class BlockBuilder {
  static async build(rootElement) {
    const QUERY_BLOCK = "[data-x\\:block]";
    const DATASET_BLOCK = "x:block";
    const DATASET_WITH_BIND_CSS = "x:withBindCss"; // notice: camel case

    const collect = (rootElement) => Array.from(rootElement.querySelectorAll(QUERY_BLOCK));
    const createBlock = async (element) => {
      const blockName = element.dataset[DATASET_BLOCK];
      const withBindCss = DATASET_WITH_BIND_CSS in element.dataset;
      return Block.build(blockName, element, withBindCss);
    };
    return await Promise.all(collect(rootElement).map(element => createBlock(element)));
  }
}