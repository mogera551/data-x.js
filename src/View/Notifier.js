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

  async updatePaths(properties = this.#context.properties) {
    const queue = await Promise.all(this.#queue);
    const updatePaths = [];
    for(const { name, indexes = [] } of queue.filter(q => q != null)) {
      const paths = await properties.updateByPatternIndexes({name, indexes})
      console.log("paths = ", paths, {name, indexes});
      updatePaths.push(...Array.from(paths));
    }
    return updatePaths;
  }

  clear(queue = this.#queue) {
    queue.splice(0);
  }
}