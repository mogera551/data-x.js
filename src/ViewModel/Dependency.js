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

  build(map = this.#map, dependencyRules = this.#context.dependencyRules) {
    map.clear();
    this.#dependencyRules = this.#context.dependencyRules.slice();
    dependencyRules.forEach(([ property, refProperties, func ]) => this.add(map, property, refProperties, func));
  }

  add(map, property, refProperties, func) {
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

  getReferedProperties(property, indexes, map = this.#map) {
    const node = map.get(property);
    const walk = (node, list) => {
      if (node == null) return list;
      list.push({
        name: PropertyName.expand(node.name, indexes ?? []),
        pattern: node.name,
        indexes: node.func ? node.func(indexes) : indexes
      });
      node.parentNodes.forEach(parentNode => {
        list = walk(parentNode, list);
      });
      return list;
    };
    const list = walk(node, []);
    const newList = [];
    list.forEach(info => {
      const setOfNames = new Set(newList.map(info => info.name));
      if (setOfNames.has(info)) return;
      newList.push(info);
    });
    return newList;
  }

}