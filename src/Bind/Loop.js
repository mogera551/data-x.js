class LoopChild {
  nodes = [];
  loops;
  binds;
  key;
}

export default class Loop {
  #dom;
  #viewModel;
  #viewModelProperty;
  #children = [];
  #context;
  #path;
  #pattern;
  #loopStack;

  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#viewModel = context.viewModel;
    this.#viewModelProperty = rule.viewModel?.property;
    this.#context = context;
    //
    const { path, pattern } = context.getPathInfo(this.#viewModelProperty);
    this.#path = path;
    this.#pattern = pattern;
    this.#loopStack = context.loopStack.slice();
  }
  get dom() { return this.#dom; }
  get viewModel() { return this.#viewModel; }
  get path() { return this.#path; }
  get pattern() { return this.#pattern; }
  get children() { return this.#children; }
  
  createChild(key, dom = this.#dom, context = this.#context) {
    return context.pushLoop({ loop:this, key }, () => {
      const indexes = context.loopStack.map(loop => loop.key);
      return context.pushIndexes(indexes, () => {
        const fragment = document.createDocumentFragment();
        const child = new LoopChild;
        child.key = key;

        const clone = dom.content.cloneNode(true);

        const info = context.viewBuilder.build(clone);
        child.binds = info.binds;
        child.loops = info.loops;
        fragment.appendChild(clone);
        Array.from(fragment.childNodes).forEach(node => child.nodes.push(node));
        return child;
      });
    });
  }

  expand() {
    Object.keys(this.viewModel[this.path]).forEach(key => {
      this.#children.push(this.createChild(key));
    });

    const fragment = document.createDocumentFragment();
    const appendNode = node => fragment.appendChild(node);
    const appendChildNodes = child => child.nodes.forEach(appendNode);
    this.#children.forEach(appendChildNodes);
    this.#dom.after(fragment);
  }

  restoreStack(callback) {
    const loopStack = this.#loopStack.slice();
    const walk = (stack) => {
      if (stack.length === 0) {
        return callback();
      }
      const loop = stack.pop();
      return context.pushLoop(loop, walk);
    };
    walk(loopStack);
  }

  removeChild(child) {
    const loopContractor = loop => loop.contract();
    const bindRemover = bind => bind.remove();
    const nodeRemover = node => node.parentNode.removeChild(node);
    child.loops.forEach(loopContractor);
    child.binds.forEach(bindRemover)
    child.nodes.forEach(nodeRemover);
  }

  contract(children = this.#children) {
    children.forEach(child => this.removeChild(child));
    children.splice(0);
  }

  update() {
    const expand = () => this.expand();
    this.contract();
    this.restoreStack(expand);
  }
}
