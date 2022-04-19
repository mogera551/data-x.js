
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
    dependencyRules.forEach(([ property, refProperties ]) => this.add(map, property, refProperties));
  }

  add(map, property, refProperties) {
    map.has(property) || map.set(property, new DepNode(property));
    const node = map.get(property);
    if (typeof refProperties === "function") {
      node.func = refProperties;
    } else {
      refProperties.forEach(refProperty => {
        map.has(refProperty) || map.set(refProperty, new DepNode(refProperty));
        const refNode = map.get(refProperty);
        node.childNodes.push(refNode);
        refNode.parentNodes.push(node);
      });
    }
  }

  getReferedProperties(property, indexes, map = this.#map) {
    const node = map.get(property);
    const walk = (node, list) => {
      if (node == null) return list;
      const isExpand = node.name.includes("*");
      const expandName = (name, indexes, tmpIndexes = indexes.splice()) => name.replaceAll("*", () => tmpIndexes.shift())
      list.push({
        name: isExpand ? expandName(node.name) : node.name,
        pattern: node.name,
        indexes
      });
      if (node.func != null) {
        list.push(node.func(...indexes));
      } else {
        node.parentNodes.forEach(parentNode => {
          list = walk(parentNode, list);
        });
      }
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