import PropertyName from "./PropertyName.js"
import {PropertyType, Property} from "./Property.js"

const NOT_FOUND = `property "%name%" is not found `;
const PREFIX_PRIVATE = "__";
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
    const isPropertyName = name => /^\@\@?([a-zA-Z0-9_\.\*])+(#(get|set|init))?$/.test(name);
    const isEventName = name => /^#(event[a-zA-Z0-9_]+)$/.test(name);
    const isPrivateName = name => /^__([a-zA-Z0-9_])+$/.test(name);

    const createInfo = () => ({
      baseName: null,
      originalName: null,
      privateName: null,
      get: null,
      set: null,
      init: null,
      requireGet: false,
      requireSet: false,
      privateValue: undefined,
    });
    const infoByBaseName = new Map();
    [viewModel].forEach(o => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([name, desc]) => {
        if (!isPropertyName(name) && !isPrivateName(name) && !isEventName(name)) return;
        if (isPrivateName(name)) {
          Reflect.defineProperty(viewModel, name, toPrivateDesc(desc));
        } else if (isPropertyName(name))  {
          const [ originalName, method ] = name.includes("#") ? name.split("#") : [ name, null ];
          const requireSet = (name.at(1) === "@");
          const baseName = requireSet ? originalName.slice(2) : originalName.slice(1);
          const info = (infoByBaseName.has(baseName)) ? infoByBaseName.get(baseName) : createInfo();
          info.baseName = info.baseName ?? baseName;
          info.originalName = info.originalName ?? originalName;
          info.privateName = info.privateName ?? `${PREFIX_PRIVATE}${baseName}`;
          info.get = method === "get" ? desc.value : info.get;
          info.set = method === "set" ? desc.value : info.set;
          info.init = method === "init" ? desc.value : info.init;
          info.requireGet = (method == null) ? true : info.requireGet;
          info.requireSet = requireSet;
          info.privateValue = (method == null) ? desc.value : info.privateValue;
          infoByBaseName.set(baseName, info);
          Reflect.deleteProperty(viewModel, name);
        } else if (isEventName(name))  {
          const originalName = name;
          const method = "set";
          const requireSet = true;
          const baseName = originalName.slice(1);
          const info = (infoByBaseName.has(baseName)) ? infoByBaseName.get(baseName) : createInfo();
          info.baseName = info.baseName ?? baseName;
          info.originalName = info.originalName ?? originalName;
          info.privateName = info.privateName ?? `${PREFIX_PRIVATE}${baseName}`;
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
      // private property name
      if (!(info.privateName in viewModel) && !info.baseName.includes(".")) {
        Reflect.defineProperty(viewModel, info.privateName, toPrivateDesc({value:info.privateValue}));
      }
      const desc = Object.getOwnPropertyDescriptor(viewModel, baseName) ?? Object.getOwnPropertyDescriptor(proto, baseName) ?? {};
      desc.get = info.get != null ? info.get : (desc.get ?? null);
      desc.set = info.set != null ? info.set : (desc.set ?? null);
      const init = info.init;
      const requireSetter = info.requireSet;
      const name = baseName;
      this.setProperty(Property.create(context, {name, desc, requireSetter, init}));
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

  async #expand(property) {
console.log("#expand start", property.name);
    const indexes = (property.type === PropertyType.EXPANDED) ? property.patternIndexes : [];
console.log(indexes);
    const value = await property.value;
console.log(value);
    const keys = Object.keys(value) ?? [];
console.log(keys);
    const context = this.#context;
    for(const patternProperty of property.referedPatternProperties) {
      const pattern = patternProperty.pattern;
      for(const key of keys) {
        const patternIndexes = indexes.concat(key);
        const path = PropertyName.expand(pattern, patternIndexes);
        if (!path.includes("*")) {
          const expandedProperty = Property.create(context, {patternProperty, patternIndexes, requireSetter:patternProperty.hasSetter });
          this.setProperty(expandedProperty);
          if (patternProperty.isArray) {
            await this.#expand(expandedProperty);
          }
        }
      }
    }
/*
    await Promise.all(property.referedPatternProperties.map(async patternProperty => {
      const pattern = patternProperty.pattern;
console.log(Object.keys(value));
      await Promise.all(keys.map(async key => {
console.log("key = ", key);
        const patternIndexes = indexes.concat(key);
console.log("patternIndexes = ", patternIndexes);
        const path = PropertyName.expand(pattern, patternIndexes);
console.log("path = ", path);
        if (!path.includes("*")) {
          const expandedProperty = Property.create(context, {patternProperty, patternIndexes, requireSetter:patternProperty.hasSetter });
          this.setProperty(expandedProperty);
          if (patternProperty.isArray) {
            this.#expand(expandedProperty);
          }
        }
      }));
    }));
*/
console.log("#expand end", property.name);
  }

  async expand(name, indexes = null) {
    const property = this.getProperty(name);
    property != null && await this.#expand(property);
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

  async #update(name, cache = this.#context.cache) {
console.log("#update start", name);
    cache.delete(name);
    const property = this.getProperty(name);
    if (property != null && property.isArray) {
      this.#contract(property);
      await this.#expand(property);
    }
console.log("#update complete", name);
  }

  async updateByName(name, cache = this.#context.cache) {
console.log("updateByName start", name);
    await this.#update(name);

    for(const info of this.#context.dependencies.getReferedProperties(name)) {
console.log("updateInfo = ", info);
      (name !== info.name) && await this.#update(info.name);
    }
console.log("updateByName complete", name);
    /*    
    const updateInfos = this.#context.dependencies.getReferedProperties(name);
console.log("updateInfos = ", updateInfos);
    updateInfos.forEach(info => (name != info.name) && this.#update(info.name));
*/
  }

  async updateByPatternIndexes({ name, indexes }) {
console.log("updateByPatternIndexes start", name, indexes);
    const propName = PropertyName.expand(name, indexes);
    await this.updateByName(propName);
  }

  async expandAll(propertyByName = this.#propertyByName) {
    await Promise.all(Array.from(propertyByName.entries()).map(async ([key, property]) => {
      if (!key.includes("*") && property.isArray) {
        this.#expand(property);
      }
    }));
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

  getDependencyNames(name) {
    const searchPattern = `${name}.`;
    const search = name => name.startsWith(searchPattern) && !name.slice(searchPattern.length).includes(".");
    const mapper = name => this.getProperty(name);
    const typeFilter = property => property.type === PropertyType.PATTERN || PropertyType.PLAIN;
    const getName = property => property.name;
    return this.names.filter(search).map(mapper).filter(typeFilter).map(getName);
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