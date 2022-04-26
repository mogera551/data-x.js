import Context from "../View/Context.js";
import container from "./Container.js"
import BlockBuilder from "../Block/BlockBuilder.js";

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

  createContext(name, parentElement) {
    this.#name = name;
    this.#context = new Context(parentElement);
    this.#context.build();
    return this.#context;
  }

  async load(name, parentElement) {
    const context = this.createContext(name, parentElement);
    const dialog = this.#dialog;
    try {
      const loader = container.blockLoader;
      const {template, module} = await loader.load(name);
  
      context.template = template;
      context.module = module;
      context.viewModel = 
        module.default?.viewModel ?? 
        (module.default?.ViewModelClass != null ? Reflect.construct(module.default.ViewModelClass, []) : {});
      context.bindRules.push(...module.default?.bindRules ?? []);
      context.dependencyRules.push(...module.default?.dependencyRules ?? []);
      const reflectContext = module.default?.context ?? module.default?._;
      (reflectContext != null) && context.reflect(reflectContext, dialog);

      context.rootElement = template.content.cloneNode(true);

      console.log(module.default);
    } catch(e) {
      throw e;
    }
  }

  async build(context = this.#context, data = this.#data) {
    context.properties.build();
    context.dependencies.build();
    ("onInit" in context.viewModel) && await context.viewModel.onInit(data);
    context.properties.expandAll();
    context.view.build();
    this.#blocks.push(...await BlockBuilder.build(context.rootElement));
    context.view.appear();
  }

}