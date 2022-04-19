
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
  #type;
  #isNew = true;
  #isUpdate = false;
  constructor(context, type, name, pattern, desc) {
    this.#context = context;
    this.#type = type;
    this.#name = name;
    this.#pattern = pattern;
    this.#desc = desc;
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

  static create(context, { name = null, desc = {}, patternProperty = null, patternIndexes = [], requireSetter = null }) {
    if (patternProperty != null) {
      return new ExpandedProperty(context, patternProperty, patternIndexes);
    } else {
      if (requireSetter === null) {
        requireSetter = ("set" in desc);
      }
      if (name.includes("*")) {
        return new PatternProperty(context, name, desc, requireSetter);
      } else {
        return new PlainProperty(context, name, desc, requireSetter);
      }
    }
  } 
  
}

// path not include "*"
export class PlainProperty extends Property {
  constructor(context, name, desc, requireSetter) {
    super(context, PropertyType.PLAIN, name, name, desc);
    this.#buildDesc(requireSetter);
    this.#addNotifiable();
  }
  testIsArray(name = this.name, properties = this.context.properties) {
    return properties.testIsArray(name);
  }
  #buildDesc(requireSetter) {
    const viewModel = this.context.viewModel;
    const pathParent = this.pathParent;
    const pathLastElement = this.pathLastElement;
    const hasParent = this.name.includes(".");
    const privateName = `$$${this.name}`;
    const getter = hasParent 
      ? function() { return this[pathParent]?.[pathLastElement]; } 
      : function() { return this[privateName]; };
    const setter = hasParent 
      ? function(v) { this[pathParent][pathLastElement] = v; } 
      : function(v) { this[privateName] = v; this.isUpdate = true; };
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
      desc.set = function(v) {
        Reflect.apply(setter, this, [v]);
        notifier.notify(name);        
        properties.update2(name);
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
  constructor(context, pattern, desc, requireSetter) {
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
    const getter = function() {
      const indexes = (context?.indexes ?? [] ).slice(0);
      const replacer = () => indexes.shift();
      const realPathParent = pathParent.replaceAll("*", replacer);
      const prop = (pathLastElement === "*") ? indexes.shift() : pathLastElement;
      return this[realPathParent]?.[prop];
    };
    const setter = function(v) {
      const indexes = (context?.indexes ?? [] ).slice(0);
      const replacer = () => indexes.shift();
      const realPathParent = pathParent.replaceAll("*", replacer);
      const prop = (pathLastElement === "*") ? indexes.shift() : pathLastElement;
      this[realPathParent][prop] = v;
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
    const indexes = patternIndexes.slice(0);
    const replacer = () => indexes.shift();
    const name = patternProperty.pattern.replaceAll("*", replacer);
    super(context, PropertyType.EXPANDED, name, patternProperty.pattern, null);
    this.#patternProperty = patternProperty;
    this.#patternIndexes = patternIndexes;
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
    const viewModel = this.context.viewModel;
    const notifier = this.context.notifier;
    const properties = this.context.properties;
    const patternProperty = this.#patternProperty;
    const patternIndexes = this.#patternIndexes;
    const name = this.name;
    const desc = {};
    desc.configurable = true;
    desc.enumerable = true;
    desc.get = function() {
      return context.pushIndexes(patternIndexes, () => {
        return this[patternProperty.pattern];
      });
    };
    if (patternProperty.desc.set != null) {
      desc.set = function(v) {
        context.pushIndexes(patternIndexes, () => {
          this[patternProperty.pattern] = v;
          notifier.notify(patternProperty.pattern, patternIndexes);
          properties.update2(name);
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

const NOT_FOUND = `property "%name%" is not found `
export default class Properties {
  #context;
  #propertyByName = new Map;
  #isUpdate = false;
  constructor(context) {
    this.#context = context;
  }
  get names() {
    return Array.from(this.#propertyByName.keys());
  }
  get values() {
    return Array.from(this.#propertyByName.values());
  }

  build(context = this.#context, viewModel = this.#context.viewModel) {
    this.#propertyByName.clear();
    const proto = Object.getPrototypeOf(viewModel);

    // "aaa", "aaa.bbb", "aaa.*.bbb"
    const isNotRealProperty = desc => desc?.get != null || desc?.set != null || (typeof desc?.value) === "function";
    const isPrivate = name => name.startsWith("$$");
    const isProperty = name => name.startsWith("@");
    const toPrivateDesc = desc => ({configurable: true, enumerable: false, writable: true, value: desc?.value});
    [viewModel].forEach(o => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
        if (isNotRealProperty(desc)) return;
        if (isPrivate(name)) {
          Reflect.defineProperty(viewModel, name, toPrivateDesc(desc));
        } else if (isProperty(name))  {
          const requireSetter = (name.at(1) === "@");
          const baseName = requireSetter ? name.slice(2) : name.slice(1);
          Reflect.deleteProperty(viewModel, name);
          // private property $$name
          const privateName = `$$${baseName}`;
          if (!(privateName in viewModel) && !baseName.includes(".")) {
            Reflect.defineProperty(viewModel, privateName, toPrivateDesc(desc));
          }
          const defineDesc = Object.getOwnPropertyDescriptor(viewModel, baseName) ?? Object.getOwnPropertyDescriptor(proto, baseName) ?? {};
          this.setProperty(Property.create(context, {name:baseName, desc:defineDesc, requireSetter}));
        }
      });
    });

    // accessor property set enumerable 
    [viewModel, proto].forEach(o => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
        if (this.#propertyByName.has(name)) return;
        if (desc?.get != null) {
          this.setProperty(Property.create(context, {name, desc, requireSetter:desc?.set != null}));
        }
      });
    });

    // complement ?
    const requiredPropertiesAll = [];
    for(const name of this.#propertyByName.keys()) {
      const properties = [];
      const names = name.split(".");
      const elements = [];
      names.forEach(element => {
        elements.push(element);
        properties.push(elements.join("."));
      });
      requiredPropertiesAll.push(...properties);
    }
    const noExists = requiredProperty => !this.#propertyByName.has(requiredProperty)
    const requiredProperties = Array.from(new Set(requiredPropertiesAll)).filter(noExists);
    requiredProperties.forEach(name => {
      const defineDesc = Object.getOwnPropertyDescriptor(viewModel, name) ?? Object.getOwnPropertyDescriptor(proto, name) ?? {};
      this.setProperty(Property.create(context, {name:name, desc:defineDesc, requireSetter:true}));
    });

    Object.defineProperty(viewModel, "$context", {
      get: () => context,
    });
  }

  removeProperty(name, object = this.#context.viewModel, propertyByName = this.#propertyByName) {
    delete object[name];
    propertyByName.delete(name);
  }

  getProperty(name, propertyByName = this.#propertyByName) {
    return propertyByName.get(name);
  }

  setProperty(property, propertyByName = this.#propertyByName) {
    propertyByName.set(property.name, property);
  }

  #expand(property) {
    const indexes = (property.type === PropertyType.EXPANDED) ? property.patternIndexes : [];
    const value = property.value;
    const context = this.#context;
    const expandPath = (pattern, indexes, tmpIndexes = indexes.slice(0)) => pattern.replaceAll("*", () => tmpIndexes.shift() ?? "*");
    property.referedPatternProperties.forEach(patternProperty => {
      const pattern = patternProperty.pattern;
      (Object.keys(value) ?? []).forEach(key => {
        const patternIndexes = indexes.concat(key);
        const path = expandPath(pattern, patternIndexes);
        if (!path.includes("*")) {
          const expandedProperty = Property.create(context, {patternProperty, patternIndexes, requireSetter:patternProperty.hasSetter });
          this.setProperty(expandedProperty);
          if (patternProperty.isArray) {
            this.#expand(expandedProperty);
          }
        }
      });
    });
  }

  expand(name, indexes = null) {
    const property = this.getProperty(name);
    this.#expand(property);
  }

  #contract(property) {
    const indexesKey = (property.type === PropertyType.EXPANDED) ? property.patternIndexes : [];
    const filterIndexes = property => property.patternIndexes.join("\t").startsWith(indexesKey);
    property.referedPatternProperties.forEach(patternProperty => {
      this.getExpandedPropertiesByPatternProperty(patternProperty).filter(filterIndexes).forEach(removeProperty => {
        this.removeProperty(removeProperty.name);
      });
    });

  }

  contract(name) {
    const property = this.getProperty(name);
    this.#contract(property);
  }

  testIsArray(name, propertyByName = this.#propertyByName) {
    return propertyByName.has(`${name}.*`);
  }

  #update(property) {
    if (property.isArray) {
      this.#contract(property);
      this.#expand(property);
    }
  }

  update2(name) {
    const property = this.getProperty(name);
    this.#update(property);

    const updateInfos = this.#context.dependencies.getReferedProperties(name);
    updateInfos.forEach(info => (name != info.name) && this.#update(this.getProperty(info.name)));
  }

  expandAll(propertyByName = this.#propertyByName) {
    Array.from(propertyByName.entries()).forEach(([key, property]) => {
      if (!key.includes("*") && property.isArray) {
        this.#expand(property);
      }
    });
  }

  has(name, propertyByName = this.#propertyByName) {
    return propertyByName.has(name);
  }

  getReferedPatternPeoperties(name) {
    const searchPattern = `${name}.`;
    const search = name => name.startsWith(searchPattern);
    const mapper = name => this.getProperty(name);
    const typeFilter = property => property.type === PropertyType.PATTERN;
    return this.names.filter(search).map(mapper).filter(typeFilter);
  }

  getExpandedPropertiesByPatternProperty(patternProperty) {
    const typeFilter = property => property.type === PropertyType.EXPANDED;
    const parentFilter = property => property.patternProperty === patternProperty;
    return this.values.filter(typeFilter).filter(parentFilter);
  }

  clearStatus() {
    return this.values.forEach(property => property.clearStatus());
  }

  get isUpdate() { 
    return this.values.some(property => property.isUpdate || property.isNew);
  }
}