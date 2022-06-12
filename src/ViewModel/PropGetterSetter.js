
export default class PropGetterSetter {
  static createDefault(context, nameInfo) {
    return (nameInfo.isPrimitive) ? PrimitivePropGetterSetter.create(context, nameInfo) :
      (nameInfo.isPath) ? PathPropGetterSetter.create(context, nameInfo) :
      (nameInfo.isPattern) ? PatternPropGetterSetter.create(context, nameInfo) : null;
  }
  static wrapGetter(context, get) {
    return function () {
      const indexes = context.indexes ?? [];
      const proxyViewModel = context.proxyViewModel;
      return Reflect.apply(get, proxyViewModel, [...indexes]);
    };
  }
  static wrapSetter(context, set) {
    return function (value) {
      const indexes = context.indexes ?? [];
      const proxyViewModel = context.proxyViewModel;
      return Reflect.apply(set, proxyViewModel, [value, ...indexes]);
    };
  }
}

class PrimitivePropGetterSetter {
  static create(context, { privateName }) {
    return {
      "get": function () { return this[privateName] },
      "set": function (value) { this[privateName] = value; }
    }
  }
}

class PathPropGetterSetter {
  static create(context, { parent, last }) {
    return {
      "get": function () { return this[parent]?.[last] },
      "set": function (value) { this[parent][last] = value; }
    }
  }
}

class PatternPropGetterSetter {
  static create(context, { parent, last, loops }) {
    const getLast = context => (last === "*") ? context.indexes.at(loops - 1) : last;
    return {
      "get": function () { return this[parent]?.[getLast(context)] },
      "set": function (value) { this[parent][getLast(context)] = value; }
    }
  }
}
