class LoopChild {
  nodes = [];
  loops;
  binds;
  key;
}

export default class Loop {
  #dom;
  #viewModelProperty;
  #children = [];
  #context;
  #path;
  #pattern;
  #loopStack;

  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#viewModelProperty = rule.viewModel?.property;
    this.#context = context;
    //
    const { path, pattern } = context.getPathInfo(this.#viewModelProperty);
    this.#path = path;
    this.#pattern = pattern;
    this.#loopStack = context.loopStack.slice();
  }
  get dom() { return this.#dom; }
  get path() { return this.#path; }
  get pattern() { return this.#pattern; }
  get children() { return this.#children; }
  
  async #createChild(key, dom = this.#dom, context = this.#context) {
    return context.pushLoop({ loop:this, key }, () => {
      const indexes = context.loopStack.map(loop => loop.key);
      return context.pushIndexes(indexes, async () => {
        const fragment = document.createDocumentFragment();
        const child = new LoopChild;
        const clone = dom.content.cloneNode(true);

        const { binds, loops } = await context.viewBuilder.build(context, clone);
        Object.assign(child, { key, binds, loops });

        fragment.appendChild(clone);
        child.nodes.push(...Array.from(fragment.childNodes));
        return child;
      });
    });
  }

  async expand(
    viewModel = this.#context.viewModel, 
    path = this.#path,
    children = this.#children,
    dom = this.#dom) {
    const values = await viewModel[path];
    for(const key of Object.keys(values)) {
      children.push(await this.#createChild(key));
    }

    const fragment = document.createDocumentFragment();
    const appendNode = node => fragment.appendChild(node);
    const appendChildNodes = child => child.nodes.forEach(appendNode);
    children.forEach(appendChildNodes);
    dom.after(fragment);
  }

  #restoreStack(callback) {
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

  #removeChild(child) {
    const loopContractor = loop => loop.contract();
    const nodeRemover = node => node.parentNode.removeChild(node);
    child.loops.forEach(loopContractor);
    child.nodes.forEach(nodeRemover);
  }

  contract(children = this.#children) {
    children.forEach(child => this.#removeChild(child));
    children.splice(0);
  }

  async update() {
    const expand = async () => this.expand();
    this.contract();
    await this.#restoreStack(expand);
  }
}
