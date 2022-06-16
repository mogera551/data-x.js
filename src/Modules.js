export default class Modules {
  static modules = {};
  static setModules(modules) {
    Object.assign(this.modules, modules);
  }
  static setModule(name, module) {
    this.modules[name] = module;
  }
  static get(name) {
    return this.modules[name];
  }
}
