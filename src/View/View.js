export default class View {
  #context;
  constructor(context) {
    this.#context = context;
  }

  build(context = this.#context, builder = this.#context.viewBuilder, rootElement = this.#context.rootElement) {
    const info = builder.build(rootElement);
    context.setBindTree(info);
    context.buildBinds();
    context.dependencies.build();
  }

  appear(context = this.#context) {
    const shadow = context.parentElement.attachShadow({mode: 'open'});
    shadow.appendChild(context.rootElement);
    context.rootElement = shadow;
  }
}
