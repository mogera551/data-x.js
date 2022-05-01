import PropertyName from "./PropertyName.js"
import {PropertyType, Property} from "./Property.js"

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
    const toPrivateDesc = desc => ({configurable: true, enumerable: false, writable: true, value: desc?.value});
    const isPropertyName = name => /^\@\@?([a-zA-Z0-9_\.\*])+(#(get|set))?$/.test(name);
    const isPrivateName = name => /^\$\$([a-zA-Z0-9_])+$/.test(name);

    const createInfo = () => ({
      baseName: null,
      originalName: null,
      privateName: null,
      get: null,
      set: null,
      requireGet: false,
      requireSet: false,
      privateValue: undefined,
    });
    const infoByBaseName = new Map();
    [viewModel].forEach(o => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
        if (!isPropertyName(name) && !isPrivateName(name)) return;
        if (isPrivateName(name)) {
          Reflect.defineProperty(viewModel, name, toPrivateDesc(desc));
        } else if (isPropertyName(name))  {
          const [ originalName, method ] = name.includes("#") ? name.split("#") : [ name, null ];
          const requireSet = (name.at(1) === "@");
          const baseName = requireSet ? originalName.slice(2) : originalName.slice(1);
          const info = (infoByBaseName.has(baseName)) ? infoByBaseName.get(baseName) : createInfo();
          info.baseName = info.baseName ?? baseName;
          info.originalName = info.originalName ?? originalName;
          info.privateName = info.privateName ?? `$$${baseName}`;
          info.get = method === "get" ? desc.value : info.get;
          info.set = method === "set" ? desc.value : info.set;
          info.requireGet = (method == null) ? true : info.requireGet;
          info.requireSet = requireSet;
          info.privateValue = (method == null) ? desc.value : info.privateValue;
          infoByBaseName.set(baseName, info);
          Reflect.deleteProperty(viewModel, name);
        }
      });
    });

    Array.from(infoByBaseName.entries()).forEach(([baseName, info]) => {
      // private property $$name
      if (!(info.privateName in viewModel) && !info.baseName.includes(".")) {
        Reflect.defineProperty(viewModel, info.privateName, toPrivateDesc({value:info.privateValue}));
      }
      const desc = Object.getOwnPropertyDescriptor(viewModel, baseName) ?? Object.getOwnPropertyDescriptor(proto, baseName) ?? {};
      desc.get = info.get != null ? info.get : (desc.get ?? null);
      desc.set = info.set != null ? info.set : (desc.set ?? null);
      const requireSetter = info.requireSet;
      const name = baseName;
      this.setProperty(Property.create(context, {name, desc, requireSetter}));
    });

    // accessor property set enumerable 
    [viewModel, proto].forEach(o => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
        if (this.#propertyByName.has(name)) return;
        if (desc?.get != null) {
          this.setProperty(Property.create(context, {name, desc, requireSetter:desc?.set != null}));
        } else if (desc?.set != null) {
          this.setProperty(Property.create(context, {name, desc, requireSetter:true}));
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

  removeProperty(name, object = this.#context.viewModel, cache = this.#context.cache, propertyByName = this.#propertyByName) {
    delete object[name];
    propertyByName.delete(name);
    cache.delete(name);
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
    property.referedPatternProperties.forEach(patternProperty => {
      const pattern = patternProperty.pattern;
      (Object.keys(value) ?? []).forEach(key => {
        const patternIndexes = indexes.concat(key);
        const path = PropertyName.expand(pattern, patternIndexes);
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
    property != null && this.#expand(property);
  }

  #contract(property) {
    const indexesKey = ((property.type === PropertyType.EXPANDED) ? property.patternIndexes : []).join("\t");
    const filterIndexes = property => property.patternIndexes.join("\t").startsWith(indexesKey);
    property.referedPatternProperties.forEach(patternProperty => {
      this.getExpandedPropertiesByPatternProperty(patternProperty).filter(filterIndexes).forEach(removeProperty => {
        this.removeProperty(removeProperty.name);
      });
    });

  }

  contract(name) {
    const property = this.getProperty(name);
    property != null && this.#contract(property);
  }

  testIsArray(name, propertyByName = this.#propertyByName) {
    return propertyByName.has(`${name}.*`);
  }

  #update(name, cache = this.#context.cache) {
    cache.delete(name);
    const property = this.getProperty(name);
    if (property != null && property.isArray) {
      this.#contract(property);
      this.#expand(property);
    }
  }

  updateByName(name, cache = this.#context.cache) {
    this.#update(name);

    const updateInfos = this.#context.dependencies.getReferedProperties(name);
    updateInfos.forEach(info => (name != info.name) && this.#update(info.name));
  }

  updateByPatternIndexes({ name, indexes }) {
    const propName = PropertyName.expand(name, indexes);
    this.updateByName(propName);
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