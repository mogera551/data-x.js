export default class Observe {
  #context;
  #observer;
  #options = {
    childList: false,
    attributes: true,
    attributeOldValue: true,
    characterDataOldValue: true,
    subtree: true,
  };
  constructor(context) {
    this.#context = context;
    this.#observer = new MutationObserver((mutationList, observer) => {
      this.changeValues(mutationList)

    });
  }

  observe(
    observer = this.#observer,
    context = this.#context,
    rootElement = context.rootElement,
    options = this.#options
  ) {
    return observer.observe(rootElement, options);
  }

  disconnect(observer = this.#observer) {
    return observer.disconnect();
  }

  changeValues(mutationList) {
    for(const mutation of mutationList) {
      this.changeValue(mutation);
    }
  }

  changeValue(mutation, context = this.#context) {
    if (mutation.type !== "attributes") return;
    const binds = context.allBinds.filter(bind => bind.dom === mutation.target);
    if (binds.length === 0) return;
    if (mutation.attributeName === "style") {
      for(const bind of binds) {
        if (!bind.domProperty.startsWith("style.")) continue;
        bind.eventHandler();
      }
    } else if (mutation.attributeName === "class") {
      for(const bind of binds) {
        if (!bind.domProperty.startsWith("class.")) continue;
        bind.eventHandler();
      }
    } else {
      for(const bind of binds) {
        if (!bind.domProperty !== mutation.attributeName) continue;
        bind.eventHandler();
      }
    }

  }

} 