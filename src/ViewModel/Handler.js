import sym from "../Symbols.js"
// 更新通知
// キャッシュ
// パターン展開
// パターン展開キャッシュ

// setter/getterキャッシュ
export default class Handler {
  #context;
  #patternCache = new Map; // { name, pattern, indexes }
  #regexpCache = new Map; // new RegExp
  constructor(context) {
    this.#context = context;
  }

  patternToRegExp(pattern) {
    return new RegExp("^" + pattern.replaceAll('.', '\\.').replaceAll('*', '([a-zA-Z0-9_]+)') + "$");
  }

  getExpandName(target, name, patternCache = this.#patternCache, regexpCache = this.#regexpCache) {
    if (patternCache.has(name)) {
      return patternCache.get(name);
    }
    for(const pattern of Object.keys(target)) {
      if (!pattern.includes("*")) continue;
      if (!regexpCache.has(pattern)) {
        regexpCache.set(pattern, this.patternToRegExp(pattern));
      }
      const regexp = regexpCache.get(pattern);
      const indexes = regexp.exec(name)?.slice(1);
      if (indexes != null) {
        const info = { name, pattern, indexes };
        patternCache.set(name, info);
        return info;
      }
      
    }
  }

  get(target, prop, receiver, context = this.#context, cache = context.cache) {
    if (cache.has(prop)) {
      return cache.get(prop);
    }
    if (prop in target) {
      const desc = Object.getOwnPropertyDescriptor(target, prop);
      const value = desc?.get ? Reflect.apply(desc.get, receiver, []) : target[prop];
      return (prop.includes("*")) ? value : cache.set(prop, value);
    } else {
      const names = this.getExpandName(target, prop);
      if (names != null) {
        return context.pushIndexes(names.indexes, () => {
          const desc = Object.getOwnPropertyDescriptor(target, names.pattern);
          return cache.set(prop, desc?.get ? Reflect.apply(desc.get, receiver, []) : target[names.pattern]);
        });
      }
    }
    console.error(`undefied property "${prop}"`);
  }

  set(target, prop, value, receiver, context = this.#context, cache = context.cache, notifier = context.notifier) {
    //
    if (cache.has(prop)) {
      cache.delete(prop);
    }
    const notify = (asyncResult, notifyInfo) => {
      notifier.notify(new Promise(async (resolve, reject) => {
        const result = await asyncResult;
        resolve((result !== sym.suspend) ? notifyInfo : null);
      }));
    }
    if (prop in target) {
      const desc = Object.getOwnPropertyDescriptor(target, prop);
      const result = desc?.set ? Reflect.apply(desc.set, receiver, [value]) : (target[prop] = value);
      desc?.set && notify(result, { name:prop });
      return true;
    } else {
      const names = this.getExpandName(target, prop);
      if (names != null) {
        context.pushIndexes(names.indexes, () => {
          const desc = Object.getOwnPropertyDescriptor(target, names.pattern);
          const result = desc?.set ? Reflect.apply(desc.set, receiver, [value]) : (target[prop] = value);
          notify(result, { name:names.pattern, indexes:names.indexes });
        });
        return true;
      }
    }
    console.error(`undefied property "${prop}"`);
  }
}
