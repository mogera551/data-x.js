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
    updateQueue = context.notifier.dequeue(), 
    allBinds = context.allBinds, 
    allLoops = context.allLoops, 
    properties = context.properties,
    dependencies = context.dependencies,
    proxyViewModel = context.proxyViewModel,
    cache = context.cache
  ) {
    (context.block.name === "job/invites/main") && console.log("updateDom ");
    (context.block.name === "job/invites/main") && console.log(updateQueue);
    const queue = await Promise.all(updateQueue);
    (context.block.name === "job/invites/main") && console.log(queue);
    const updatePaths = [];
    for(const { name, indexes = [] } of queue.filter(q => q != null)) {
      updatePaths.push(PropertyName.expand(name, indexes));
      for(const info of dependencies.getReferedProperties(name, indexes)) {
        updatePaths.push(info.name);
      }
    }
    const setOfUpdatePaths = new Set(updatePaths);
    (context.block.name === "job/invites/main") && console.log(setOfUpdatePaths);
    for(const path of Array.from(setOfUpdatePaths)) {
      cache.delete(path);
      const value = await Reflect.get(proxyViewModel, path);
      (context.block.name === "job/invites/main") && console.log(path, value);
    }

    for(const loop of allLoops.filter(loop => setOfUpdatePaths.has(loop.path))) {
      await loop.update();
    }

    for(const bind of allBinds.filter(bind => setOfUpdatePaths.has(bind.path))) {
      await bind.updateDom();
    }
    context.buildBinds();
  }

  static async execProcess(context, processor = context.processor) {
    processor.exec();
  }

}
