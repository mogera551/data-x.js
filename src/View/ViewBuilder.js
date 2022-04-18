import Bind from "../Bind/Bind.js";
import Loop from "../Bind/Loop.js";
import Event from "../Bind/Event.js";
import Collect from "../Bind/Collect.js";

const PROCESSED = "processed";
const QUERY_PROCESSED = `[data-${PROCESSED}]`;
const QUERY_IGNORE = `[data-ignore]`;

export default class ViewBuilder {
  #context;
  constructor(context) {
    this.#context = context;
  }

  expand(loops) {
    loops.forEach(loop => loop.expand());
  }

  assign(binds) {
    binds.forEach(bind => bind.init());
  }

  attach(events) {
    events.forEach(event => event.init());
  }

  build(rootElement, context = this.#context) {
    const { loops, binds, events } = Collect.collect(context, rootElement);
    this.expand(loops);
    this.assign(binds);
    this.attach(events);
    return { loops, binds, events };
  }

}
