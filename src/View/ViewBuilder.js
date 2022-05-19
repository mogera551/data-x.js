import Collect from "../Bind/Collect.js";

export default class ViewBuilder {
  static async build(context, rootElement, bindRules = context.bindRules) {
    const { loops, binds, events } = Collect.collect(context, rootElement, bindRules);
    await Promise.all(loops.map(loop => loop.expand()));
    await Promise.all(binds.map(bind => bind.init()));
    events.forEach(event => event.init());
    return { loops, binds, events };
  }

}
