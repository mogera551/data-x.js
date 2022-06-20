import eventHandler from "./EventHandler.js"

const PREFIX_PRIVATE = "__";
export default class Initializer {
  static async init(context, data, proxyViewModel = context.proxyViewModel, properties = context.properties) {
    await eventHandler.exec(proxyViewModel, "init", data);
    for(const property of properties) {
      if (property?.init == null) continue;
      const asyncResult = Reflect.apply(property.init, proxyViewModel, [data]);
      const result = (asyncResult instanceof Promise) ? await asyncResult : asyncResult;
      property.nameInfo.isPrimitive ? (proxyViewModel[property.nameInfo.privateName] = result) : (proxyViewModel[property.name] = result);
    }
  }
}