import PropNameInfo from "./PropNameInfo.js"
import PropGetterSetter from "./PropGetterSetter.js"

// プロパティの変換
//
const RegExpShortHandProperty = new RegExp(/^(\@\@?)([a-zA-Z0-9_\.\*]+)(#(get|set|init)?)?$/);
const RegExpEventProperty = new RegExp(/^(#)(event[a-zA-Z0-9_]+)$/);
const RegExpPrivateProperty = new RegExp(/^__([a-zA-Z0-9_])+$/);

const walkPrototype = (object, callback) => {
  do {
    callback(object);
    object = Object.getPrototypeOf(object);
  } while(object !== Object.prototype)
}

class Property {
  name;
  nameInfo;
  init;
}

export default class Props {
  static build(context, viewModel = context.viewModel) {
    const properties = [];
    const matchPropertyName = name => RegExpShortHandProperty.exec(name);
    const matchEventName = name => RegExpEventProperty.exec(name);
    const matchPrivateName = name => RegExpPrivateProperty.exec(name);
    const toPrivateDesc = desc => ({configurable: true, enumerable: false, writable: true, value: desc?.value});
    const infoByName= new Map;
    //
    const createInfo = () => ({
      baseName: null,
      get: null,
      set: null,
      init: null,
      requireSet: undefined,
      initValue: undefined,
    });
    const setPropertyInfo = ([, access, baseName, hasMethod, method], desc) => {
      const info = infoByName.has(baseName) ? infoByName.get(baseName) : createInfo();
      info.baseName = info.baseName ?? baseName;
      const checkFunc = (func, type) => (typeof func === "function") ? func : console.error(`${baseName}.${type} is not function`);
      if (hasMethod != null && method == null) {
        if (typeof desc.value !== "object") console.error(`${baseName}.# is not object`);
        info.get = info.get ?? desc.value?.get ? checkFunc(desc.value.get, "#get") : info.get;
        info.set = info.set ?? desc.value?.set ? checkFunc(desc.value.set, "#set") : info.set;
        info.init = info.init ?? desc.value?.init ? checkFunc(desc.value.init, "#init") : info.init;
      } else if (hasMethod != null && method != null) {
        info.get = info.get ?? method === "get" ? checkFunc(desc.value, "#get") : info.get;
        info.set = info.set ?? method === "set" ? checkFunc(desc.value, "#set") : info.set;
        info.init = info.init ?? method === "init" ? checkFunc(desc.value, "#init") : info.init;
      }
      info.requireSet = (info.requireSet === undefined) ? (access == "@@") : info.requireSet;
      (info.requireSet !== undefined && info.requireSet != (access == "@@")) && console.error("@@ is not match");
      info.initValue = (hasMethod == null) ? desc?.value : info.initValue;
      infoByName.set(baseName, info);
      return info;
    }
    const setEventInfo = ([ ,, baseName ], desc) => {
      const checkFunc = (func) => (typeof func === "function") ? func : console.error(`#${baseName} is not function`);
      const info = infoByName.has(baseName) ? infoByName.get(baseName) : createInfo();
      info.baseName = info.baseName ?? baseName;
      info.set = info.set ?? checkFunc(desc.value);
      info.requireSet = true;
      infoByName.set(baseName, info);
      return info;
    }

    // "@Property", "#Event", "__Private"
    walkPrototype(viewModel, object => {
      Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(([name, desc]) => {
        const resultPropertyName = matchPropertyName(name);
        const resultEventName = matchEventName(name);
        const resultPrivateName = matchPrivateName(name);
        if (resultPropertyName === null && resultPrivateName === null && resultEventName === null) return;
        if (resultPrivateName !== null) {
          // enumerable => false
          Reflect.defineProperty(viewModel, name, toPrivateDesc(desc));
        } else if (resultPropertyName !== null) {
          setPropertyInfo(resultPropertyName, desc);
          // remove property
          Reflect.deleteProperty(object, name);
        } else if (resultEventName !== null) {
          setEventInfo(resultEventName, desc);
          // remove property
          Reflect.deleteProperty(object, name);
        }
      });
    })

    const findDesc = (object, name) => object !== Object.prototype ? (Object.getOwnPropertyDescriptor(object, name) ?? findDesc(Object.getPrototypeOf(object))) : {};
    Array.from(infoByName.entries()).forEach(([name, info]) => {
      const nameInfo = PropNameInfo.get(name);
      
      // create private property
      if (!(nameInfo.privateName in viewModel) && nameInfo.isPrimitive) {
        Reflect.defineProperty(viewModel, nameInfo.privateName, toPrivateDesc({value:info.initValue}));
      }
      const definedDesc = findDesc(viewModel, name); // get prop(), set prop(value)
      const defaultDesc = PropGetterSetter.createDefault(context, nameInfo);
      const desc = { configurable: true, enumerable: true };
      desc.get = (info.get ? PropGetterSetter.wrapGetter(context, info.get) : null) ?? definedDesc.get ?? defaultDesc.get;
      if (info.requireSet) {
        desc.set = (info.set ? PropGetterSetter.wrapSetter(context, info.set) : null) ?? definedDesc.set ?? defaultDesc.set;
      }
      Object.defineProperty(viewModel, name, desc);
      properties.push(Object.assign(new Property(), { name, nameInfo, init: info?.init }));
    });

    walkPrototype(viewModel, object => {
      if (viewModel === object) return;
      Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(([name, desc]) => {
        if (viewModel.hasOwnProperty(name)) return;
        if (desc?.get == null && desc?.set == null) return;
        const nameInfo = PropNameInfo.get(name);
        if (desc?.get == null && desc?.set != null) {
          const defaultDesc = PropGetterSetter.createDefault(context, nameInfo);
          desc.get = defaultDesc.get;
        }
        desc.enumerable = true;
        Object.defineProperty(viewModel, name, desc);
        properties.push(Object.assign(new Property(), { name, nameInfo }));
      });
    })

    // 
    const requiredPropertiesAll = [];
    Array.from(Object.keys(viewModel)).forEach(name => {
      const elements = name.split(".");
      const properties = elements.reduce((arr, cur) => (arr.push(arr.at(-1)?.slice() ?? []), arr.at(-1).push(cur), arr) , [])
      requiredPropertiesAll.push(...properties.map(elements => elements.join(".")));
    });
    const noExists = name => !viewModel.hasOwnProperty(name)
    const requiredProperties = Array.from(new Set(requiredPropertiesAll)).filter(noExists);
    requiredProperties.forEach(name => {
      const desc = {configurable: true, enumerable: true};
      const nameInfo = PropNameInfo.get(name);
      const defaultDesc = PropGetterSetter.createDefault(context, nameInfo);
      desc.get = defaultDesc.get;
      Object.defineProperty(viewModel, name, desc);
      properties.push(Object.assign(new Property(), { name, nameInfo }));
    });

    return properties;
  }

  static getDependencyNames(properties, name) {
    const searchPattern = `${name}.`;
    const search = name => name.startsWith(searchPattern) && !name.slice(searchPattern.length).includes(".");
    return properties.map(prop => prop.name).filter(search);
  }
}
