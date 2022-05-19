const DATASET_NAME = "x:name";
export default class Event {
  #dom;
  #context;
  #rule;
  #event;
  #indexes;
  #handlerName;
  #eventName;

  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#rule = rule;
    this.#event = rule.dom?.event;
    this.#context =context;
    this.#indexes = context.indexes?.slice() ?? [];
    this.#handlerName = this.getHandlerName();
  }
  get event() { return this.#event; }
  get dom() { return this.#dom; }
  get handlerName() { return this.#handlerName; }

  init() {
    this.attachEvent();
  }

  getHandlerName() {
    const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
    const dom = this.#dom;
    const event = this.#event.toLowerCase();
    const domName = (DATASET_NAME in dom?.dataset) ? dom?.dataset[DATASET_NAME] : (dom?.name?.length > 0) ? dom.name : dom.tagName.toLowerCase();
    return `${event}${toFirstUpper(domName)}`;
  }

  async eventHandler(
    event, 
    viewModel = this.#context.viewModel, 
    eventHandler = this.#context.eventHandler,
    handlerName = this.handlerName, 
    indexes = this.#indexes,
    context = this.#context
  ) {
    return context.pushIndexes(indexes, () => {
      console.log("eventHandler start");
      const result = eventHandler.exec(viewModel, handlerName, event, ...indexes);
      console.log("eventHandler end");
      return result;
    });
  }

  attachEvent(dom = this.#dom, event = this.#event, viewUpdater = this.#context.viewUpdater) {
    const handler = e => viewUpdater.updateProcess(() => this.eventHandler(e));
    dom.addEventListener(event, handler);
  }
}
