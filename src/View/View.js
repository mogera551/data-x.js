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

  static appear(context) {
    const shadow = context.parentElement.attachShadow({mode: 'open'});
    shadow.appendChild(context.rootElement);
    context.rootElement = shadow;
  }

  static async updateDom(
    context,
    notifier = context.notifier, 
    allBinds = context.allBinds, 
    allLoops = context.allLoops, 
    dependencies = context.dependencies
  ) {
    const updatePaths = [];
    const conv = ({name, indexes}) => ({ name: PropertyName.expand(name, indexes), pattern:name, indexes });
    const getUpdatePaths = ({name, indexes}) => updatePaths.push(...dependencies.getReferedProperties(name, indexes), conv({name, indexes}));
    notifier.queue.forEach(getUpdatePaths);
    const setOfUpdatePaths = new Set(updatePaths.map(info => info.name));
    const updateLoop = loop => loop.update();
    await Promise.all(allLoops.filter(loop => setOfUpdatePaths.has(loop.path)).map(updateLoop));

    const updateBind = bind => bind.updateDom();
    await Promise.all(allBinds.filter(bind => setOfUpdatePaths.has(bind.path)).map(updateBind));
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
