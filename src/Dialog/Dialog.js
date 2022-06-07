import { Block } from "../Block/Block.js";
import ModuleRoot from "../Block/ModuleRoot.js";

const DATA_DIALOG = "x:dialog"

export default class Dialog {
  #block;
  #data;
  #name;
  #root;
  #fg;
  #bg;
  #resolve;
  #reject;
  constructor(name, data) {
    this.#name = name;
    this.#data = data;
  }
  get name() { return this.#name; }
  get data() { return this.#data; }
  get block() { return this.#block; }
  get root() { return this.#root; }

  createBackLayer(name = this.#name) {
    const root = document.createElement("div");
    root.dataset[DATA_DIALOG] = name;
  
    // background
    const bg = document.createElement("div");
    bg.style.position = "fixed";
    bg.style.display = "flex";
    bg.style.alignItems = "center";
    bg.style.justifyContent = "space-around";
    bg.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    bg.style.left = "0";
    bg.style.top = "0";
    bg.style.height = "100vh";
    bg.style.width = "100vw";
    bg.style.zIndex = "499";
    bg.classList.add("bg");
    bg.addEventListener("click", e => this.cancelDialog());
    root.appendChild(bg);
    
    // foreground
    const fg = document.createElement("div");
    fg.style.backgroundColor = "white";
    fg.style.borderRadius = ".375rem";
    fg.style.padding = "2rem";
    fg.classList.add("fg");
    fg.addEventListener("click", e => e.stopPropagation());
    bg.appendChild(fg);

    return { root, bg, fg };
  }
  
  async build(name = this.#name, data = this.#data, withBindCss = false) {
    const { root, bg, fg } = this.createBackLayer(name);

    const rootBlock = new ModuleRoot(data);
    const block = await Block.create({name, parentElement:fg, withBindCss, rootBlock, dialog:this});
    rootBlock.blocks.push(block);

    document.body.appendChild(root);

    this.#block = block;
    this.#root = root;

    return this;
  }

  static async create(name = this.#name, data = this.#data, withBindCss = false) {
    const dialog = new Dialog(name, data);
    return dialog.build(name, data, withBindCss);
  }

  cancelDialog() {
    this.#reject && this.#reject();
  }

  closeDialog(data) {
    this.#resolve && this.#resolve(data);
  }

  async main() {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    }).finally(() => {
      this.#root.parentNode.removeChild(this.#root);
    });
  }

  static async open(name, data = {}) {
    const dialog = await Dialog.create(name, data);
    return dialog.main();
  }
}

