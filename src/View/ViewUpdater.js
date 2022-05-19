import PropertyName from "../ViewModel/PropertyName.js"

export default class ViewUpdator {
  #context;
  #processQueue = [];
  constructor(context) {
    this.#context = context;
  }

  registPostProcess(callback) {
    this.#processQueue.push(callback);
  }

  async postProcess() {
    const processes = this.#processQueue.slice();
    const promises = [];
    if (processes.length > 0) {
      this.updateProcess(() => {
        for(const procsess of processes) {
          promises.push(procsess());
        }
      });
    }
    return Promise.all(promises);
  }

  clearPostProcess() {
    this.#processQueue.splice(0);
  }

  async updateDom(
    notifier = this.#context.notifier, 
    allBinds = this.#context.allBinds, 
    allLoops = this.#context.allLoops, 
    dependencies = this.#context.dependencies
  ) {
    console.log("start updateDom");
    const updatePaths = [];
    const conv = ({name, indexes}) => ({ name: PropertyName.expand(name, indexes), pattern:name, indexes });
    const getUpdatePaths = ({name, indexes}) => updatePaths.push(...dependencies.getReferedProperties(name, indexes), conv({name, indexes}));
    notifier.queue.forEach(getUpdatePaths);
    const setOfUpdatePaths = new Set(updatePaths.map(info => info.name));
console.log("setOfUpdatePaths = ", setOfUpdatePaths)
    const updateLoop = loop => loop.update();
    await Promise.all(allLoops.filter(loop => setOfUpdatePaths.has(loop.path)).map(updateLoop));
console.log("loop end");

    const updateBind = bind => bind.updateDom();
    await Promise.all(allBinds.filter(bind => setOfUpdatePaths.has(bind.path)).map(updateBind));
console.log("bind end");

    console.log("complete updateDom");
  }

  async updateProcess(
    updateCallback, 
    context = this.#context, 
    notifier = this.#context.notifier, 
    properties = this.#context.properties
  ) {
//    console.log(`${context.block.name} updateProcess`);
    this.clearPostProcess();
    notifier.clear();
    properties.clearStatus();

    const result = await updateCallback();
    console.log("updateCallback() = ", result);
    await result;
//    console.log("call updateDom()");

    await this.updateDom();
    properties.isUpdate && context.buildBinds();

    await this.postProcess();
  }
} 