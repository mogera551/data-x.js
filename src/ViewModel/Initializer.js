import eventHandler from "./EventHandler.js"

const PREFIX_PRIVATE = "__";
export default class Initializer {
  static async init(context, data, viewModel = context.viewModel, properties = context.properties) {
    const promises = [];
    for(const property of properties.values) {
      const assign = value => property.name.includes(".") ? (viewModel[property.name] = value) : (viewModel[`${PREFIX_PRIVATE}${property.name}`] = value);
      property?.init && (
        (property.init).constructor.name === "AsyncFunction" ?
          promises.push(property.init(data).then(value => assign(value))) : assign(property.init(data))
      );
    }
    await Promise.all(promises);
    return eventHandler.exec(viewModel, "init", data);
  }
}