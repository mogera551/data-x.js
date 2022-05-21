export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  async notify(name, indexes = [], queue = this.#queue, properties = this.#context.properties) {
    queue.push({name, indexes});
    await properties.updateByPatternIndexes({name, indexes});
  }

  clear(queue = this.#queue) {
    queue.splice(0);
  }
}