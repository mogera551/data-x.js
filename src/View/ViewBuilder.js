import Collect from "../Bind/Collect.js";

export default class ViewBuilder {
  static build(context, rootElement) {
    const { loops, binds, events } = Collect.collect(context, rootElement);
    loops.forEach(loop => loop.expand());
    binds.forEach(bind => bind.init());
    events.forEach(event => event.init());
    return { loops, binds, events };
  }

}
