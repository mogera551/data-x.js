export default class Container {
  #valueByName = new Map;
  #classByName = new Map;

  registData = [];

  static registAll(container, registData = container.registData) {
    registData.forEach(([ name, value, ...dependencies ]) => {
      Container.regist(container, name, value, ...dependencies);
    });
    return container;
  }

  static regist(container, name, value, ...dependencies) {
    if (typeof value === "function") {
      container.#classByName.set(name, value);
    } else {
      container.#valueByName.set(name, value);
    }
    Object.defineProperty(container, name, {
      configurable: true,
      get: () => {
        if (container.#valueByName.has(name)) {
          return container.#valueByName.get(name);
        }
        if (container.#classByName.has(name)) {
          const className = container.#classByName.get(name);
          const value = new className(...(dependencies.map(prop => container[prop])));
          return value;
        }
      }
    });

  }
}
