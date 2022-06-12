export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  notify(promise, queue = this.#queue) {
    // { name, indexes }
    queue.push(promise);
  }

  dequeue(queue = this.#queue) {
    const resultQueue = queue.slice();
    queue.splice(0);
    return resultQueue;
  }

  clear(queue = this.#queue) {
    queue.splice(0);
  }
}