export default class EventHandler {
  static async exec(proxyViewModel, name, ...args) {
    const propName = name[0].toUpperCase() + name.slice(1);
    const eventPrperty = `event${propName}`;
    const eventHandler = `on${propName}`;
    if (eventPrperty in proxyViewModel) {
      const desc = Object.getOwnPropertyDescriptor(proxyViewModel, eventPrperty);
      return Reflect.apply(desc.set, proxyViewModel, [args]);
    } else if (eventHandler in proxyViewModel) {
      return proxyViewModel[eventHandler](...args);
    }
  }
}