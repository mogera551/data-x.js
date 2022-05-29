
export default class Notifiable {
  #name;
  #context;
  constructor(context) {
    this.#context = context;
  }

  has(target, prop) {
    if (prop === "__notifiable") {
      return true;
    }
    return Reflect.has(target, prop);
  }

  get(target, prop, receiver) {
    if (prop === "__notifiable") {
      return true;
    }
    if (prop === "__name") {
      return this.#name;
    }
    return Reflect.get(target, prop, receiver);
  }

  set(target, prop, value, receiver) {
    if (prop === "__name") {
      this.#name = value;
      return true;
    }
    if (prop === "length") {
      const name = this.#name;
      (name != null) && this.#context.notifier.notify({ name });
    }
    return Reflect.set(target, prop, value, receiver);
  }

  static notifiable(context, object) {
    return new Proxy(object, new Notifiable(context));
  }

}
