import eventHandler from "./EventHandler.js"

export default class Initializer {
  static async init(context, data, viewModel = context.viewModel, properties = context.properties) {
    const promises = [];
    for(const property of properties.values) {
      property?.init && promises.push(property.init(data).then(value => viewModel[property.name] = value));
    }
    await Promise.all(promises);
    return eventHandler.exec(viewModel, "init", data);
  }
}