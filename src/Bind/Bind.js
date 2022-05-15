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

  static updateDomByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
    const walk = (props, o, v, name = props.shift()) => (props.length === 0) ? ((o[name] !== v) && (o[name] = v)) : walk(props, o[name], v);
    const assignValue = value => walk(properties, bind.dom, value);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static updateDomByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
    const assignValue = value => value ? !bind.dom.classList.contains(className) && bind.dom.classList.add(className) 
          : bind.dom.classList.contains(className) && bind.dom.classList.remove(className);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static updateDomByRadioType(bind) {
    const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
    const assignValue = value => bind.dom.checked = (bind.dom.value === value);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static updateDomByCheckboxType(bind) {
    const value = bind.filter.forward(bind.forwardFilters, bind.viewModel[bind.path]);
    const assignValue = value => bind.dom.checked = (value ?? []).includes(bind.dom.value);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static setValue = (bind, value) => {
    const desc = Object.getOwnPropertyDescriptor(bind.viewModel, bind.path);
    return desc?.set ? Reflect.apply(desc.set, bind.viewModel, [value]) : (bind.viewModel[path] = value);
  }

  static updateViewModelByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const walk = (props, o, name = props.shift()) => (props.length === 0) ? o[name] : walk(props, o[name]);
    const value = bind.filter.backward(bind.backwardFilters, walk(properties, bind.dom));
    return this.setValue(bind, value);
  }

  static updateViewModelByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = bind.dom.classList.contains(className);
    return this.setValue(bind, value);
  }

  static updateViewModelByRadioType(bind) {
    if (bind.dom.checked) {
      const value = bind.dom.value;
      return this.setValue(bind, value);
    }
  }

  static updateViewModelByCheckboxType(bind) {
    const setOfValues = new Set(bind.viewModel[bind.path] ?? []);
    if (bind.dom.checked) {
      setOfValues.add(bind.dom.value);
    } else {
      setOfValues.delete(bind.dom.value);
    }
    const value = Array.from(setOfValues);
    return this.setValue(bind, value);
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

  static updateDom(bind, type = bind.domPropertyType) {
    Reflect.apply(this.#updateDomProcs[type], this, [bind]);
  }

  static updateViewModel(bind, type = bind.domPropertyType) {
    return Reflect.apply(this.#updateViewModelProcs[type], this, [bind]);
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

  init(inputable = this.#inputable) {
    if (inputable) {
      this.attachEvent();
    }
    this.updateDom();
  }

  updateDom() {
    DomPropertyType.updateDom(this);
  }

  updateViewModel() {
    DomPropertyType.updateViewModel(this);
  }
  
  attachEvent(dom = this.#dom, viewUpdater = this.#context.viewUpdater) {
    const handler = e => viewUpdater.updateProcess(() => this.updateViewModel());
    dom.addEventListener("input", handler);
  }
}

DomPropertyType.init();