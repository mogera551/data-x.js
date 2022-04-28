
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
    this.#eventName = this.getEventName();
  }
  get event() { return this.#event; }
  get dom() { return this.#dom; }
  get handlerName() { return this.#handlerName; }
  get eventName() { return this.#eventName; }

  init() {
    this.attachEvent();
  }

  getHandlerName() {
    const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
    const dom = this.#dom;
    const event = this.#event.toLowerCase();
    const domName = (DATASET_NAME in dom?.dataset) ? dom?.dataset[DATASET_NAME] : (dom?.name?.length > 0) ? dom.name : dom.tagName;
    return `on${toFirstUpper(event)}${toFirstUpper(domName.toLowerCase())}`;
  }

  getEventName() {
    const toFirstUpper = (string) => (string?.length > 0) ? (string.at(0).toUpperCase() + string.slice(1)) : "";
    const dom = this.#dom;
    const event = this.#event.toLowerCase();
    const domName = (DATASET_NAME in dom?.dataset) ? dom?.dataset[DATASET_NAME] : (dom?.name?.length > 0) ? dom.name : dom.tagName;
    return `event${toFirstUpper(event)}${toFirstUpper(domName.toLowerCase())}`;
  }

  eventHandler(
    event, 
    viewModel = this.#context.viewModel, 
    eventName = this.eventName, 
    handlerName = this.handlerName, 
    indexes = this.#indexes) {
    if (eventName in viewModel) {
      const range = Array.from(Array(indexes.length), (v, k) => k); // range
      range.forEach(i => event[`$${i + 1}`] = indexes[i]);
      event.$indexes = indexes.slice(0);
      viewModel[eventName] = event;
    } else if (handlerName in viewModel) {
      viewModel[handlerName](event, ...indexes);
    }
  }

  attachEvent(dom = this.#dom, event = this.#event, viewUpdator = this.#context.viewUpdator) {
    const handler = e => viewUpdator.updateProcess(() => this.eventHandler(e));
    dom.addEventListener(event, handler);
  }
}
