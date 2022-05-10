import PropertyName from "./PropertyName.js"

const PREFIX_PRIVATE = "__";
export class PropertyType {
  static PLAIN = 1;
  static PATTERN = 2;
  static EXPANDED = 3;
}

export class Property {
  #name;
  #pattern;
  #pathLastElement;
  #pathParent;
  #context;
  #desc;
  #init;
  #type;
  #isNew = true;
  #isUpdate = false;
  #propName;
  constructor(context, type, name, pattern, desc, init) {
    this.#context = context;
    this.#type = type;
    this.#name = name;
    this.#pattern = pattern;
    this.#desc = desc;
    this.#init = init;
    const elements = name.split(".");
    this.#pathLastElement = elements.pop();
    this.#pathParent = elements.join(".");
  }
  get context() {
    return this.#context;
  }
  get name() {
    return this.#name;
  }
  get pathParent() {
    return this.#pathParent;
  }
  get pathLastElement() {
    return this.#pathLastElement;
  }
  get desc() {
    return this.#desc;
  }
  get init() {
    return this.#init;
  }
  get type() {
    return this.#type;
  }
  get pattern() {
    return this.#pattern;
  }
  get isArray() {
    return this.testIsArray();
  }
  get referedPatternProperties() {
    return this.getReferedPatternPeoperties();
  }
  get value() {
    return this.getValue();
  }
  get isNew() {
    return this.#isNew;
  }
  get isUpdate() {
    return this.#isUpdate;
  }
  get hasSetter() {
    return this.desc.set != null;
  }
  set desc(v) {
    this.#desc = v;
    Object.defineProperty(this.#context.viewModel, this.#name, v);
  }
  set isNew(v) {
    this.#isNew = v;
  }
  set isUpdate(v) {
    this.#isUpdate = v;
  }
  testIsArray() { return false; }
  getReferedPatternPeoperties() { return []; }
  getValue() { throw new Error(''); }
  clearStatus() {
    this.isNew = false;
    this.isUpdate = false;
  }

  static create(context, { name = null, desc = {}, patternProperty = null, patternIndexes = [], requireSetter = null, init = null }) {
    if (patternProperty != null) {
      return new ExpandedProperty(context, patternProperty, patternIndexes);
    } else {
      if (requireSetter === null) {
        requireSetter = ("set" in desc);
      }
      if (name.includes("*")) {
        return new PatternProperty(context, name, desc, requireSetter, init);
      } else {
        return new PlainProperty(context, name, desc, requireSetter, init);
      }
    }
  } 
  
}

// path not include "*"
export class PlainProperty extends Property {
  constructor(context, name, desc, requireSetter, init) {
    super(context, PropertyType.PLAIN, name, name, desc, init);
    this.#buildDesc(requireSetter);
    this.#addNotifiable();
  }
  testIsArray(name = this.name, properties = this.context.properties) {
    return properties.testIsArray(name);
  }
  #buildDesc(requireSetter) {
    const viewModel = this.context.viewModel;
    const cache = this.context.cache;
    const pathParent = this.pathParent;
    const pathLastElement = this.pathLastElement;
    const hasParent = this.name.includes(".");
    const privateName = `${PREFIX_PRIVATE}${this.name}`;
    const name = this.name;
    const getter = hasParent 
      ? function() { 
        return cache.has(name) ? cache.get(name) : cache.set(name, this[pathParent]?.[pathLastElement]);
      } 
      : function() { 
        return cache.has(name) ? cache.get(name) : cache.set(name, this[privateName]);
      };
    const setter = hasParent 
      ? function(v) { this[pathParent][pathLastElement] = v; cache.delete(name); } 
      : function(v) { this[privateName] = v; this.isUpdate = true; cache.delete(name); };
    const desc = this.desc;
    const defaultDesc = {
      configurable: true,
      enumerable: true,
      get: desc.get ? desc.get : getter,
    };
    if (requireSetter) {
      defaultDesc.set = desc.set ? desc.set : setter;
    }
    this.desc = defaultDesc;
  }
  #addNotifiable() {
    const notifier = this.context.notifier;
    const properties = this.context.properties;
    const setter = this.desc.set;
    const desc = this.desc;
    const name = this.name;
    if (desc.set != null) {
      desc.set = async function(v) {
        const result = Reflect.apply(setter, this, [v]);
        const notify = (value) => (value !== false) && notifier.notify(name);
        (result instanceof Promise) ? result.then(notify) : notify(result);
        return result;       
      };
      this.desc = desc;
    }
  }
  getReferedPatternPeoperties(properties = this.context.properties, name = this.name) {
    return properties.getReferedPatternPeoperties(name);
  }
  getValue() {
    return Reflect.apply(this.desc.get, this.context.viewModel, [this.name]);
  }
}

// path include "*"
export class PatternProperty extends Property {
  constructor(context, pattern, desc, requireSetter, init) {
    super(context, PropertyType.PATTERN, pattern, pattern, desc);
    this.#buildDesc(requireSetter);
  }
  testIsArray(pattern = this.pattern, properties = this.context.properties) {
    return properties.testIsArray(pattern);
  }
  #buildDesc(requireSetter) {
    const context = this.context;
    const viewModel = this.context.viewModel;
    const pathParent = this.pathParent;
    const pathLastElement = this.pathLastElement;
    const loopLevel = this.pattern.split("").filter(c => c === "*").length;
    const getter = function() {
      const indexes = context?.indexes ?? [];
      const prop = (pathLastElement === "*") ? indexes.at(loopLevel - 1) : pathLastElement;
      return this[pathParent]?.[prop];
    };
    const setter = function(v) {
      const indexes = context?.indexes ?? [];
      const prop = (pathLastElement === "*") ? indexes.at(loopLevel - 1) : pathLastElement;
      this[pathParent][prop] = v;
      this.isUpdate = true;
    };
    const desc = this.desc;
    const defaultDesc = {
      configurable: true,
      enumerable: true,
      get: desc.get ? desc.get : getter,
    };
    if (requireSetter) {
      defaultDesc.set = desc.set ? desc.set : setter;
    }
    this.desc = defaultDesc;

  }
  getReferedPatternPeoperties(properties = this.context.properties, pattern = this.pattern) {
    return properties.getReferedPatternPeoperties(pattern);
  }
}

// expanded
export class ExpandedProperty extends Property {
  #patternProperty;
  #patternIndexes;
  constructor(context, patternProperty, patternIndexes) {
    const name = PropertyName.expand(patternProperty.pattern, patternIndexes);
    super(context, PropertyType.EXPANDED, name, patternProperty.pattern, null, patternProperty.init);
    this.#patternProperty = patternProperty;
    this.#patternIndexes = patternIndexes.slice();
    this.#buildDesc();
  }
  get patternProperty() {
    return this.#patternProperty;
  }
  get patternIndexes() {
    return this.#patternIndexes;
  }
  #buildDesc() {
    const context = this.context;
    const cache = this.context.cache;
    const viewModel = this.context.viewModel;
    const notifier = this.context.notifier;
    const properties = this.context.properties;
    const patternProperty = this.patternProperty;
    const patternIndexes = this.patternIndexes;
    const name = this.name;
    const desc = {};
    desc.configurable = true;
    desc.enumerable = true;
    desc.get = () => {
      const self = this;
      return context.pushIndexes(patternIndexes, () => {
        return cache.has(name) ? cache.get(name) : cache.set(name, viewModel[patternProperty.pattern]);
      });
    };

    if (patternProperty.desc.set != null) {
      desc.set = (v) => {
        const self = this;
        context.pushIndexes(patternIndexes, () => {
          viewModel[patternProperty.pattern] = v;
          notifier.notify(patternProperty.pattern, patternIndexes);
        });
      };
    }
    this.desc = desc;
  }
  testIsArray(pattern = this.patternProperty.pattern, properties = this.context.properties) {
    return properties.testIsArray(pattern);
  }
  getReferedPatternPeoperties(patternProperty = this.patternProperty) {
    return patternProperty.referedPatternProperties;
  }
  getValue() {
    return Reflect.apply(this.desc.get, this.context.viewModel, [this.name]);
  }
}

