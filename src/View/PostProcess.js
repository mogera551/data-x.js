export default class PostProcess {
  #context;
  #queue = [];
  constructor(context) {
    this.#context = context;
  }

  regist(callback, queue = this.#queue) {
    queue.push(callback);
  }

  exec(context = this.#context, queue = this.#queue, view = context.view) {
    const processes = queue.slice();
    queue.splice(0);
    const promises = [];
    if (processes.length > 0) {
      for(const procsess of processes) {
        promises.push(procsess());
      }
    }
    return Promise.all(promises);
  }

  clear(queue = this.#queue) {
    queue.splice(0);
  }
}
