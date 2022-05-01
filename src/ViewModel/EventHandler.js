export default class EventHandler {
  static async exec(viewModel, name, ...args) {
    const propName = name[0].toUpperCase() + name.slice(1);
    const eventPrperty = `event${propName}`;
    const eventHandler = `on${propName}`;
    if (eventPrperty in viewModel) {
      viewModel[eventPrperty] = args;
    } else if (eventHandler in viewModel) {
      viewModel[eventHandler](...args);
    }
  }
}