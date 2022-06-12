import Filter from "./Filter.js";

class FileReaderEx extends FileReader{
  constructor(){
    super();
  }

  #readAs(blob, ctx){
    return new Promise((resolve, reject)=>{
      super.addEventListener("load", ({target}) => resolve(target.result));
      super.addEventListener("error", ({target}) => reject(target.error));
      super[ctx](blob);
    });
  }

  readAsArrayBuffer(blob){
    return this.#readAs(blob, "readAsArrayBuffer");
  }

  readAsDataURL(blob){
    return this.#readAs(blob, "readAsDataURL");
  }

  readAsText(blob){
    return this.#readAs(blob, "readAsText");
  }
  
}

class DomPropertyType {
  static VALUE = 1;
  static CLASS = 2;
  static RADIO = 3;
  static CHECKBOX = 4;
  static FILE = 5;
  static MULTI = 6;

  static matchClass = "class.";
  static matchFile = "file";
  static matchRadio = "radio";
  static matchCheckbox = "checkbox";
  static matchMulti = "multi";

  static getType(property) {
    return (
      (property === this.matchFile) ? this.FILE
      : (property === this.matchRadio) ? this.RADIO
      : (property === this.matchCheckbox) ? this.CHECKBOX
      : (property === this.matchMulti) ? this.MULTI
      : (property.startsWith(this.matchClass)) ? this.CLASS
      : this.VALUE
    );
  }

  static async getValue(proxyViewModel, path) {
    return proxyViewModel[path];
  }

  static async updateDomByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const value = await this.getValue(bind.proxyViewModel, bind.path);
    const walk = (props, o, v, name = props.shift()) => (props.length === 0) ? ((o[name] !== v) && (o[name] = v)) : walk(props, o[name], v);
    const assignValue = value => walk(properties, bind.dom, bind.filter.forward(bind.forwardFilters, value));
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = await this.getValue(bind.proxyViewModel, bind.path);
    const assignValue = value => bind.filter.forward(bind.forwardFilters, value) ? !bind.dom.classList.contains(className) && bind.dom.classList.add(className) 
          : bind.dom.classList.contains(className) && bind.dom.classList.remove(className);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByRadioType(bind) {
    const value = await this.getValue(bind.proxyViewModel, bind.path);
    const assignValue = value => bind.dom.checked = (bind.dom.value === bind.filter.forward(bind.forwardFilters, value));
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByCheckboxType(bind) {
    const value = await this.getValue(bind.proxyViewModel, bind.path);
    const assignValue = value => bind.dom.checked = (bind.filter.forward(bind.forwardFilters, value) ?? []).includes(bind.dom.value);
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async updateDomByFileType(bind) {
  }

  static async updateDomByMultiType(bind) {
    const value = await this.getValue(bind.proxyViewModel, bind.path);
    const assignValue = value => {
      const values = (bind.filter.forward(bind.forwardFilters, value) ?? []);
      Array.from(bind.dom.options).forEach(o => o.selected = (values.includes(o.value)));
    }
    (value instanceof Promise) ? value.then(value => assignValue(value)) : assignValue(value);
  }

  static async setValue(proxyViewModel, path, value) {
    proxyViewModel[path] = value;
  }

  static async updateViewModelByValueType(bind) {
    const properties = bind.domProperty.split(".");
    const walk = (props, o, name = props.shift()) => (props.length === 0) ? o[name] : walk(props, o[name]);
    const value = bind.filter.backward(bind.backwardFilters, walk(properties, bind.dom));
    await this.setValue(bind.proxyViewModel, bind.path, value);
  }

  static async updateViewModelByClassType(bind) {
    const className = bind.domProperty.slice(this.matchClass.length);
    const value = bind.dom.classList.contains(className);
    await this.setValue(bind.proxyViewModel, bind.path, value);
  }

  static async updateViewModelByRadioType(bind) {
    if (bind.dom.checked) {
      const value = bind.dom.value;
      await this.setValue(bind.proxyViewModel, bind.path, value);
    }
  }

  static async updateViewModelByCheckboxType(bind) {
    const setOfValues = new Set(bind.proxyViewModel[bind.path] ?? []);
    if (bind.dom.checked) {
      setOfValues.add(bind.dom.value);
    } else {
      setOfValues.delete(bind.dom.value);
    }
    const value = Array.from(setOfValues);
    await this.setValue(bind.proxyViewModel, bind.path, value);
  }

  static async updateViewModelByFileType(bind) {
    if (bind.dom.files.length == 0) return;
    const reader = new FileReaderEx();
    const data = await reader.readAsText(bind.dom.files[0]);
    const value = bind.filter.backward(bind.backwardFilters, data);
    await this.setValue(bind.proxyViewModel, bind.path, value);
  }

  static async updateViewModelByMultiType(bind) {
    const values = Array.from(bind.dom.selectedOptions).map(o => o.value);
    await this.setValue(bind.proxyViewModel, bind.path, values);
  }

  static #updateDomProcs = {};
  static #updateViewModelProcs = {};

  static init() {
    this.#updateDomProcs[this.VALUE] = this.updateDomByValueType;
    this.#updateDomProcs[this.CLASS] = this.updateDomByClassType;
    this.#updateDomProcs[this.RADIO] = this.updateDomByRadioType;
    this.#updateDomProcs[this.CHECKBOX] = this.updateDomByCheckboxType;
    this.#updateDomProcs[this.FILE] = this.updateDomByFileType;
    this.#updateDomProcs[this.MULTI] = this.updateDomByMultiType;

    this.#updateViewModelProcs[this.VALUE] = this.updateViewModelByValueType;
    this.#updateViewModelProcs[this.CLASS] = this.updateViewModelByClassType;
    this.#updateViewModelProcs[this.RADIO] = this.updateViewModelByRadioType;
    this.#updateViewModelProcs[this.CHECKBOX] = this.updateViewModelByCheckboxType;
    this.#updateViewModelProcs[this.FILE] = this.updateViewModelByFileType;
    this.#updateViewModelProcs[this.MULTI] = this.updateViewModelByMultiType;
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
  #proxyViewModel;
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
    this.#proxyViewModel = context.proxyViewModel;
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
  get proxyViewModel() { return this.#proxyViewModel; }
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

  async #updateViewModel() {
    await DomPropertyType.updateViewModel(this);
  }
  
  attachEvent(dom = this.#dom, context = this.#context, view = context.view) {
    const handler = async e => {
//      console.log("attachEvent start", context?.block?.name);
      await context.$updateProcess(() => this.#updateViewModel())
//      console.log("attachEvent complete", context?.block?.name);
    };
    dom.addEventListener("input", handler);
  }
}

DomPropertyType.init();