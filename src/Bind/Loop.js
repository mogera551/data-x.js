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
  
  async createChild(key, dom = this.#dom, context = this.#context) {
    return context.pushLoop({ loop:this, key }, async () => {
      const indexes = context.loopStack.map(loop => loop.key);
      return context.pushIndexes(indexes, async () => {
        const fragment = document.createDocumentFragment();
        const child = new LoopChild;
        child.key = key;

        const clone = dom.content.cloneNode(true);

        const info = await context.viewBuilder.build(context, clone);
        child.binds = info.binds;
        child.loops = info.loops;
        fragment.appendChild(clone);
        Array.from(fragment.childNodes).forEach(node => child.nodes.push(node));
        return child;
      });
    });
  }

  async expand() {
    const values = await this.viewModel[this.path];
    const children = await Promise.all(Object.keys(values).map(key => this.createChild(key)));
    this.#children.push(...children);

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
    return walk(loopStack);
  }

  removeChild(child) {
    const loopContractor = loop => loop.contract();
    const nodeRemover = node => node.parentNode.removeChild(node);
    child.loops.forEach(loopContractor);
    child.nodes.forEach(nodeRemover);
  }

  contract(children = this.#children) {
    children.forEach(child => this.removeChild(child));
    children.splice(0);
  }

  async update() {
    const expand = async () => this.expand();
    this.contract();
    await this.restoreStack(expand);
  }
}
