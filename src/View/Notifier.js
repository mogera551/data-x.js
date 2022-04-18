export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  notify(...args) {
    this.#queue.push(...args);
  }

  clear() {
    this.#queue.splice(0);
  }
}