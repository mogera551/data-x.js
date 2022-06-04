import eventHandler from "./EventHandler.js"

const PREFIX_PRIVATE = "__";
export default class Initializer {
  static async init(context, data, viewModel = context.viewModel, properties = context.properties) {
    await eventHandler.exec(viewModel, "init", data);
    for(const property of properties.values) {
      if (property?.init == null) continue;
      const asyncResult = property.init(data);
      const result = (asyncResult instanceof Promise) ? await asyncResult : asyncResult;
      property.name.includes(".") ? (viewModel[property.name] = result) : (viewModel[`${PREFIX_PRIVATE}${property.name}`] = result);
    }
  }
}