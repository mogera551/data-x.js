export default class Notifier {
  #queue = [];
  #context;
  constructor(context) {
    this.#context = context;
  }
  get queue() { return this.#queue; }
  
  notify(promise, queue = this.#queue, context = this.#context) {
    // { name, indexes }
    queue.push(promise);
    context.eventLoop.wakeup();
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