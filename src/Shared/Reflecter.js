const PREFIX_SHARED = "$";
export default class Reflecter {
  static reflect(context, data, reflectData = {}) {
    Object.keys(data).forEach(name => {
      const sharedName = `${PREFIX_SHARED}${name}`;
      const notifyAll = result => (result !== false) && context.$postUpdate(() => {
        context.$notify(sharedName);
        context.$notifyAll(sharedName);
      });
      const desc = {
        configurable: false,
        enumerable: true,
        get: () => Reflect.get(data, name),
        set: value => {
          const result = Reflect.set(data, name, value);
          (result instanceof Promise) ? result.then(notifyAll) : notifyAll(result);
          return result;
        },
      };
      Object.defineProperty(reflectData, sharedName, desc);
    } );
  }
}