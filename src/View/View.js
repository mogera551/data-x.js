import Collect from "../Bind/Collect.js";
import PropertyName from "../ViewModel/PropertyName.js"

export default class View {
  static async createBindTree(context, rootElement, bindRules = context.bindRules) {
    const { loops, binds, events } = Collect.collect(context, rootElement, bindRules);
    await Promise.all(loops.map(loop => loop.expand()));
    await Promise.all(binds.map(bind => bind.init()));
    events.forEach(event => event.init());
    return { loops, binds, events };
  }

  static async build(context, rootElement = context.rootElement) {
    const bindTree = await this.createBindTree(context, rootElement);
    context.setBindTree(bindTree);
    context.buildBinds();
  }

  static appear(context, fragment = context.fragment, parentElement = context.parentElement) {
    const shadow = parentElement.attachShadow({mode: 'open'});
    shadow.appendChild(fragment);
    context.rootElement = shadow;
  }

  static attachTo(context, parentElement) {
    context.parentElement = parentElement;
    this.appear(context);
  }

  static async updateDom(
    context,
    updateQueue = context.updateQueue, 
    allBinds = context.allBinds, 
    allLoops = context.allLoops, 
    properties = context.properties,
    viewModel = context.viewModel
  ) {
//    console.log("updateDom start", context?.block?.name);
    const queue = await Promise.all(updateQueue);
    const updatePaths = [];
    for(const { name, indexes = [] } of queue.filter(q => q != null)) {
      const paths = await properties.updateByPatternIndexes({name, indexes})
//      console.log("paths = ", paths, {name, indexes});
      updatePaths.push(...Array.from(paths));
    }
  
    const setOfUpdatePaths = new Set((updatePaths).map(info => info.name));
//    console.log("setOfUpdatePaths", setOfUpdatePaths);

    await Promise.all(Array.from(setOfUpdatePaths).map(path => Reflect.get(viewModel, path)));

    const updateLoop = loop => loop.update();
    await Promise.all(allLoops.filter(loop => setOfUpdatePaths.has(loop.path)).map(updateLoop));

    const updateBind = bind => bind.updateDom();
    await Promise.all(allBinds.filter(bind => setOfUpdatePaths.has(bind.path)).map(updateBind));

    properties.isUpdate && context.buildBinds();
//    console.log("updateDom complete", context?.block?.name);
  }

  static async postProcess(context, postProcess = context.postProcess) {
    postProcess.exec();
  }

  static async updateProcess(
    context, 
    updateCallback, 
    notifier = context.notifier, 
    properties = context.properties,
    postProcess = context.postProcess,
  ) {
    postProcess.clear();
    notifier.clear();
    properties.clearStatus();

    await updateCallback();

    await this.updateDom(context);
    properties.isUpdate && context.buildBinds();

    await postProcess.exec();
  }

}
