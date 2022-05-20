export default class View {
  #context;
  constructor(context) {
    this.#context = context;
  }

  async build(context = this.#context, builder = this.#context.viewBuilder, rootElement = this.#context.rootElement) {
    const bindTree = await builder.build(context, rootElement);
    context.setBindTree(bindTree);
    context.buildBinds();
  }

  appear(context = this.#context) {
    const shadow = context.parentElement.attachShadow({mode: 'open'});
    shadow.appendChild(context.rootElement);
    context.rootElement = shadow;
  }
}
