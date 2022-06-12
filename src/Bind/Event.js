const DATASET_NAME = "x:name";
export default class Event {
  #dom;
  #context;
  #event;
  #indexes;
  #handlerName;

  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#event = rule.dom?.event;
    this.#context =context;
    this.#indexes = context.indexes?.slice() ?? [];
    this.#handlerName = this.#getHandlerName();
  }
  get event() { return this.#event; }
  get dom() { return this.#dom; }

  init() {
    this.#attachEvent();
  }

  #getHandlerName() {
    const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
    const dom = this.#dom;
    const event = this.#event.toLowerCase();
    const domName = (DATASET_NAME in dom?.dataset) ? dom?.dataset[DATASET_NAME] : (dom?.name?.length > 0) ? dom.name : dom.tagName.toLowerCase();
    return `${event}${toFirstUpper(domName)}`;
  }

  async #eventHandler(
    event, 
    proxyViewModel = this.#context.proxyViewModel, 
    eventHandler = this.#context.eventHandler,
    handlerName = this.#handlerName, 
    indexes = this.#indexes,
    context = this.#context
  ) {
    return context.pushIndexes(indexes, () => {
      return eventHandler.exec(proxyViewModel, handlerName, event, ...indexes);
    });
  }

  #attachEvent(dom = this.#dom, event = this.#event, context = this.#context, view = context.view) {
    const handler = async e => {
//      console.log("attachEvent start", context?.block?.name);
      await context.$updateProcess(() => this.#eventHandler(e));
//      console.log("attachEvent complete", context?.block?.name);
    }
    dom.addEventListener(event, handler);
  }
}
