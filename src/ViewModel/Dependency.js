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
    dependencyRules.forEach(([ property, refProperties, func ]) => this.add(property, refProperties, func));
    this.implicitDependency();
  }

  implicitDependency(properties = this.#context.properties) {
    // implicit dependency
    for(const name of properties.names) {
      properties.getDependencyNames(name).forEach(depName => this.add(depName, [name]));
    }
  }

  add(property, refProperties, func, map = this.#map) {
    map.has(property) || map.set(property, new DepNode(property));
    const node = map.get(property);
    node.func = func;
    refProperties.forEach(refProperty => {
      map.has(refProperty) || map.set(refProperty, new DepNode(refProperty));
      const refNode = map.get(refProperty);
      node.childNodes.push(refNode);
      refNode.parentNodes.push(node);
    });
  }

  getReferedProperties(property, indexes, map = this.#map, viewModel = this.#context.viewModel) {
//    console.log("getReferedProperties start ", property, indexes);
    const node = map.get(property);
    const trace = new Set();
    const curIndex = indexes ?? [];
    const walk = (node, list) => {
      if (node == null) return list;
      const name = PropertyName.expand(node.name, curIndex);
      if (name !== null) {
        if (trace.has(name)) return list;
        trace.add(name);
        const resultIndexes = node.func ? Reflect.apply(node.func, viewModel, [curIndex]) : curIndex;
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