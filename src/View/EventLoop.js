
export default class EventLoop {
  context;
  resolve;
  reject;
  terminating = false;

  constructor(context) {
    this.context = context;
  }

  wakeup() {
    this.resolve != null && this.resolve(true);
  }

  terminate() {
    this.terminating = true;
    this.resolve != null && this.resolve(true);
  }

  wait(context = this.context) {
    this.resolve = null;
    this.reject = null;
    return new Promise((resolve, reject) => {
      if (context.processor.queue.length > 0 || context.notifier.queue.length > 0) {
        resolve(true);
      } else {
        if (this.terminating) {
          resolve(false);
        } else {
          this.resolve = resolve;
          this.reject = reject;
        }
      }
    });
  }

  async start(context = this.context) {
    this.main();
  }

  async main(context = this.context) {
    while(true) {
      context.observer.observe();
      const terminate = ! await this.wait();
      context.observer.disconnect();
      if (terminate) break;
      await context.view.execProcess(context);
      await context.view.updateDom(context);
    }
    console.log("terminate ", context.block.name);
  }
}