export default class Event {
  #dom;
  #context;
  #rule;
  #event;
  #indexes;

  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#rule = rule;
    this.#event = rule.dom?.event;
    this.#context =context;
    this.#indexes = context.indexes?.slice() ?? [];
  }

  init() {
    this.attachEvent();
  }

  get event() { return this.#event; }
  get dom() { return this.#dom; }

  get handlerName() {
    const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
    const dom = this.#dom;
    const eventName = this.#event.toLowerCase();
    const domName = (dom?.name?.length > 0) ? dom.name.toLowerCase() : dom.tagName.toLowerCase();
    return `on${toFirstUpper(eventName)}${toFirstUpper(domName)}`;
  }

  eventHandler(event, viewModel = this.#context.viewModel, handlerName = this.handlerName, indexes = this.#indexes) {
    (handlerName in viewModel) && viewModel[handlerName](event, ...indexes);
  }

  attachEvent(dom = this.#dom, event = this.#event, viewUpdator = this.#context.viewUpdator) {
    const handler = e => viewUpdator.updateProcess(() => this.eventHandler(e));
    dom.addEventListener(event, handler);
  }
}
