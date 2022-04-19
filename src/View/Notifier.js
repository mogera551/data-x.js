export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  notify(name, indexes = []) {
    this.#queue.push({name, indexes});
  }

  clear() {
    this.#queue.splice(0);
  }
}