import Context from "../View/Context.js";
import container from "./Container.js"
import BlockBuilder from "../Block/BlockBuilder.js";
import Rules from "../Bind/Rules.js"

export default class Block {
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

    const initializer = context.initializer;
    await initializer.init(context, data);
    context.properties.expandAll();
    context.view.build();
    this.#blocks.push(...await BlockBuilder.build(context.rootElement));
    context.view.appear();
  }

  async notifyAll(pattern, indexes, fromBlock) {
    const viewModel = this.#context.viewModel;
    const eventHandler = this.#context.eventHandler;
    for(const block of this.#blocks) {
      block.notifyAll(pattern, indexes, fromBlock);
    }
    (fromBlock !== this) && eventHandler.exec(viewModel, "notifyAll", pattern, indexes, fromBlock);
  }

  async inquiryAll(message, param1, param2, fromBlock) {
    const viewModel = this.#context.viewModel;
    const eventHandler = this.#context.eventHandler;
    for(const block of this.#blocks) {
      block.inquiryAll(message, param1, param2, fromBlock);
    }
    eventHandler.exec(viewModel, "inquiryAll", message, param1, param2, fromBlock);
  }
}