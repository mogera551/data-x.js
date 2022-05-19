import Filter from "./Filter.js";
class DomPropertyType {
  static VALUE = 1;
  static CLASS = 2;
  static RADIO = 3;
  static CHECKBOX = 4;

  static matchClass = "class.";
  static matchRadio = "radio";
  static matchCheckbox = "checkbox";

  static getType(property) {
    return (
      (property === this.matchRadio) ? this.RADIO
      : (property === this.matchCheckbox) ? this.CHECKBOX
      : (property.startsWith(this.matchClass)) ? this.CLASS
      : this.VALUE
    );
  }

  static async getValue(viewModel, path) {
    const desc = Object.getOwnPropertyDescriptor(viewModel, path);
    return desc?.get ? await Reflect.apply(desc.get, viewModel, []) : viewModel[path];
  }
  static async updateDomByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const value = await this.getValue(bind.viewModel, bind.path);
    const walk = (props, o, v, name = props.shift()) => (props.length === 0) ? ((o[name] !== v) && (o[name] = v)) : walk(props, o[name], v);
    const assignValue = value => walk(properties, bind.dom, bind.filter.forward(bind.forwardFilters, value));
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = await this.getValue(bind.viewModel, bind.path);
    const assignValue = value => bind.filter.forward(bind.forwardFilters, value) ? !bind.dom.classList.contains(className) && bind.dom.classList.add(className) 
          : bind.dom.classList.contains(className) && bind.dom.classList.remove(className);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByRadioType(bind) {
    const value = await this.getValue(bind.viewModel, bind.path);
    const assignValue = value => bind.dom.checked = (bind.dom.value === bind.filter.forward(bind.forwardFilters, value));
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByCheckboxType(bind) {
    const value = await this.getValue(bind.viewModel, bind.path);
    const assignValue = value => bind.dom.checked = (bind.filter.forward(bind.forwardFilters, value) ?? []).includes(bind.dom.value);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async setValue(viewModel, path, value) {
    const desc = Object.getOwnPropertyDescriptor(viewModel, path);
    desc?.set ? await Reflect.apply(desc.set, viewModel, [value]) : (bind.viewModel[path] = value);
  }

  static async updateViewModelByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const walk = (props, o, name = props.shift()) => (props.length === 0) ? o[name] : walk(props, o[name]);
    const value = bind.filter.backward(bind.backwardFilters, walk(properties, bind.dom));
    await this.setValue(bind.viewModel, bind.path, value);
  }

  static async updateViewModelByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = bind.dom.classList.contains(className);
    await this.setValue(bind.viewModel, bind.path, value);
  }

  static async updateViewModelByRadioType(bind) {
    if (bind.dom.checked) {
      const value = bind.dom.value;
      await this.setValue(bind.viewModel, bind.path, value);
    }
  }

  static async updateViewModelByCheckboxType(bind) {
    const setOfValues = new Set(bind.viewModel[bind.path] ?? []);
    if (bind.dom.checked) {
      setOfValues.add(bind.dom.value);
    } else {
      setOfValues.delete(bind.dom.value);
    }
    const value = Array.from(setOfValues);
    await this.setValue(bind.viewModel, bind.path, value);
  }

  static #updateDomProcs = {};
  static #updateViewModelProcs = {};

  static init() {
    this.#updateDomProcs[this.VALUE] = this.updateDomByValueType;
    this.#updateDomProcs[this.CLASS] = this.updateDomByClassType;
    this.#updateDomProcs[this.RADIO] = this.updateDomByRadioType;
    this.#updateDomProcs[this.CHECKBOX] = this.updateDomByCheckboxType;

    this.#updateViewModelProcs[this.VALUE] = this.updateViewModelByValueType;
    this.#updateViewModelProcs[this.CLASS] = this.updateViewModelByClassType;
    this.#updateViewModelProcs[this.RADIO] = this.updateViewModelByRadioType;
    this.#updateViewModelProcs[this.CHECKBOX] = this.updateViewModelByCheckboxType;
  }

  static async updateDom(bind, type = bind.domPropertyType) {
    await Reflect.apply(this.#updateDomProcs[type], this, [bind]);
  }

  static async updateViewModel(bind, type = bind.domPropertyType) {
    await Reflect.apply(this.#updateViewModelProcs[type], this, [bind]);
  }
}

export default class Bind {
  #context;
  #dom;
  #domProperty;
  #viewModel;
  #viewModelProperty;
  #inputable;
  #indexes;
  #path;
  #pattern;
  #domPropertyType;
  #forwardFilters;
  #backwardFilters;
  
  constructor(dom, rule, context) {
    this.#dom = dom;
    this.#domProperty = rule.dom?.property;
    this.#viewModel = context.viewModel;
    this.#viewModelProperty = rule.viewModel?.property;
    this.#inputable = rule.inputable;
    this.#forwardFilters = Filter.parse(rule?.filters.join("|")) ?? [];
    this.#backwardFilters = this.#forwardFilters.slice().reverse();

    this.#context = context;
    this.#indexes = context.indexes?.slice() ?? [];
    this.#domPropertyType = DomPropertyType.getType(this.#domProperty);

    //
    const { path, pattern } = context.getPathInfo(this.#viewModelProperty);
    this.#path = path;
    this.#pattern = pattern; 
  }

  get dom() { return this.#dom; }
  get domProperty() { return this.#domProperty }
  get viewModel() { return this.#viewModel; }
  get path() { return this.#path; }
  get pattern() { return this.#pattern; }
  get domPropertyType() { return this.#domPropertyType; } 
  get forwardFilters() { return this.#forwardFilters; }
  get backwardFilters() { return this.#backwardFilters; }
  get filter() { return this.#context.filter; }

  async init(inputable = this.#inputable) {
    if (inputable) {
      this.attachEvent();
    }
    await this.updateDom();
  }

  async updateDom() {
    await DomPropertyType.updateDom(this);
  }

  async updateViewModel() {
    await DomPropertyType.updateViewModel(this);
  }
  
  attachEvent(dom = this.#dom, viewUpdater = this.#context.viewUpdater) {
    const handler = async e => await viewUpdater.updateProcess(() => this.updateViewModel());
    dom.addEventListener("input", handler);
  }
}

DomPropertyType.init();