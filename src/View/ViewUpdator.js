export default class ViewUpdator {
  #context;
  #processQueue = [];
  constructor(context) {
    this.#context = context;
  }

  registPostProcess(callback) {
    this.#processQueue.push(callback);
  }

  postProcess() {
    this.#processQueue.forEach(process => process());
  }

  clearPostProcess() {
    this.#processQueue.splice(0);
  }

  updateDom(
    notifier = this.#context.notifier, 
    allBinds = this.#context.allBinds, 
    allLoops = this.#context.allLoops, 
    dependencies = this.#context.dependencies
  ) {
    const updatePaths = [];
    const isExpand = name => name.includes("*");
    const expandName = (name, indexes, tmpIndexes = indexes.splice(0)) => name.replaceAll("*", () => tmpIndexes.shift());
    const conv = ({name, indexes}) => ({ name: isExpand(name) ? expandName(name, indexes) : name, pattern:name, indexes });
    const getUpdatePaths = ({name, indexes}) => updatePaths.push(...dependencies.getReferedProperties(name, indexes), conv({name, indexes}));
    notifier.queue.forEach(getUpdatePaths);
    const setOfUpdatePaths = new Set(updatePaths.map(info => info.name));

    const updateLoop = loop => loop.update();
    allLoops.filter(loop => setOfUpdatePaths.has(loop.path)).forEach(updateLoop);

    const updateBind = bind => bind.updateDom();
    allBinds.filter(bind => setOfUpdatePaths.has(bind.path)).forEach(updateBind);
  }

  async updateProcess(
    updateCallback, 
    context = this.#context, 
    notifier = this.#context.notifier, 
    properties = this.#context.properties
  ) {
    this.clearPostProcess();
    notifier.clear();
    properties.clearStatus();

    await updateCallback();

    this.updateDom();
    properties.isUpdate && context.buildBinds();

    this.postProcess();
  }
} 