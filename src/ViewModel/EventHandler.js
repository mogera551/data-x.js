export default class EventHandler {
  static async exec(viewModel, name, ...args) {
    const propName = name[0].toUpperCase() + name.slice(1);
    const eventPrperty = `event${propName}`;
    const eventHandler = `on${propName}`;
    if (eventPrperty in viewModel) {
      const desc = Object.getOwnPropertyDescriptor(viewModel, eventPrperty);
      return Reflect.apply(desc.set, viewModel, [args]);
    } else if (eventHandler in viewModel) {
      return viewModel[eventHandler](...args);
    }
  }
}