export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  async notify(name, indexes = []) {
    this.#queue.push({name, indexes});
    await this.#context.properties.updateByPatternIndexes({name, indexes});
  }

  clear() {
    this.#queue.splice(0);
  }
}