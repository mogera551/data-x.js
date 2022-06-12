import PropertyName from "./PropertyName.js"

class DepNode {
  parentNodes = [];
  name;
  func;
  childNodes = [];
  constructor(name) {
    this.name = name;
  }
}

export default class Dependencies {
  #map = new Map;
  #dependencyRules;
  #context;
  constructor(context) {
    this.#context = context;
  }

  get map() { return this.#map; }

  build(map = this.#map, dependencyRules = this.#context.dependencyRules) {
    map.clear();
    this.#dependencyRules = this.#context.dependencyRules.slice();
    dependencyRules.forEach(([ propName, refProperties, func ]) => this.add(propName, refProperties, func));
    this.implicitDependency();
  }

  implicitDependency(props = this.#context.props, properties = this.#context.properties) {
    // implicit dependency
    for(const property of properties) {
      props.getDependencyNames(properties, property.name).forEach(depName => this.add(depName, [property.name]));
    }
  }

  add(propName, refProperties, func, map = this.#map) {
    map.has(propName) || map.set(propName, new DepNode(propName));
    const node = map.get(propName);
    node.func = func;
    refProperties.forEach(refProperty => {
      map.has(refProperty) || map.set(refProperty, new DepNode(refProperty));
      const refNode = map.get(refProperty);
      node.childNodes.push(refNode);
      refNode.parentNodes.push(node);
    });
  }

  getReferedProperties(propName, indexes, map = this.#map, proxyViewModel = this.#context.proxyViewModel) {
//    console.log("getReferedProperties start ", propName, indexes);
    const node = map.get(propName);
    const trace = new Set();
    const curIndex = indexes ?? [];
    const walk = (node, list) => {
      if (node == null) return list;
      const name = PropertyName.expand(node.name, curIndex);
      if (name !== null) {
        if (trace.has(name)) return list;
        trace.add(name);
        const resultIndexes = node.func ? Reflect.apply(node.func, proxyViewModel, [curIndex]) : curIndex;
        if (resultIndexes === false) return list;
        const resultInfo = { name, pattern: node.name, indexes: resultIndexes };
        list.push(resultInfo);
      }
      node.parentNodes.forEach(parentNode => {
        list = walk(parentNode, list);
      });
      return list;
    };
    const list = walk(node, []);
//    console.log("getReferedProperties complete", list);
    return list;
  }

}