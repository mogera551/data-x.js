import Root from "./Block/Root.js"

export default class App {
  static root;
  static option;
  static async boot(option) {
    this.option = option;
    this.root = new Root(this);
    this.root.build();
  }
}