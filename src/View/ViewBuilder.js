import Collect from "../Bind/Collect.js";

export default class ViewBuilder {
  static build(context, rootElement, bindRules = context.bindRules) {
    const { loops, binds, events } = Collect.collect(context, rootElement, bindRules);
    loops.forEach(loop => loop.expand());
    binds.forEach(bind => bind.init());
    events.forEach(event => event.init());
    return { loops, binds, events };
  }

}
