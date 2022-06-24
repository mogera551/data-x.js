import sym from "../Symbols.js";

const PREFIX_SHARED = "$";
export default class Reflecter {
  static reflect(context, data, reflectData = {}, notifier = context.notifier) {
    Object.keys(data).forEach(name => {
      const sharedName = `${PREFIX_SHARED}${name}`;
      const desc = {
        configurable: false,
        enumerable: true,
        get: () => Reflect.get(data, name),
        set: value => {
          Reflect.set(data, name, value);
          notifier.notify(new Promise((resolve, reject) => {
            context.$notifyAll(sharedName);
            resolve({ name: sharedName });
          }));
        },
      };
      Object.defineProperty(reflectData, sharedName, desc);
    } );
  }
}