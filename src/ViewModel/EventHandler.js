export default class EventHandler {
  static async exec(proxyViewModel, name, ...args) {
    if (name in proxyViewModel) {
      const desc = Object.getOwnPropertyDescriptor(proxyViewModel, name);
      return Reflect.apply(desc.set, proxyViewModel, args);
    }
  }
}