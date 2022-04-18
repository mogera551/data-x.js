
class DepNode {
  parentNodes = [];
  name;
  childNodes = [];
  constructor(name) {
    this.name = name;
  }
}

export default class Dependencies {
  #map = new Map;
  #origDependencyRules;
  #dependencyRules;
  #context;
  #isUpdate = false;
  constructor(context) {
    this.#context = context;
  }

  setup(dependencyRules = this.#context.dependencyRules) {
    this.#dependencyRules = dependencyRules.slice();
  }
  build(map = this.#map, dependencyRules = this.#dependencyRules) {
    map.clear();
    dependencyRules.forEach(([ property, refProperties ]) => this.add(map, property, refProperties));
  }
  rebuild(map = this.#map, dependencyRules = this.#dependencyRules) {
    map.clear();
    dependencyRules.forEach(([ property, refProperties ]) => this.add(map, property, refProperties));
  }

  add(map, property, refProperties) {
    if (property.includes("*") || refProperties.find(property => property.includes("*"))) return;
    map.has(property) || map.set(property, new DepNode(property));
    const node = map.get(property);
    refProperties.forEach(refProperty => {
      map.has(refProperty) || map.set(refProperty, new DepNode(refProperty));
      const refNode = map.get(refProperty);
      node.childNodes.push(refNode);
      refNode.parentNodes.push(node);
    });
  }

  expandDependency(path, pattern, indexes, dependencyRules = this.#dependencyRules) {
    const newRules = dependencyRules.map(([ property, refProperties ]) => {
      const matchProp = (property === pattern);
      const matchRef = (refProperties.includes(pattern));
      if (!matchProp && !matchRef) return null;
      const expandProperty = property => {
        const tmpIndexes = indexes.slice();
        return property.replaceAll("*", () => tmpIndexes.shift() ?? "*")
      }
      const newProperty = expandProperty(property);
      const newRefProperties = refProperties.map(property => {
        if (!matchRef) return property;
        if (!property.includes("*")) return property;
        const newProperty = expandProperty(property);
        if (newProperty.includes("*")) return property;
        return newProperty;
      });
      if (newProperty.includes("*") || newRefProperties.find(property => property.includes("*"))) return null;
      return [newProperty, newRefProperties];
    }).filter(info => info != null);
    dependencyRules.push(...newRules);
    this.#isUpdate = true;
  }

  removeDependency(path, dependencyRules = this.#dependencyRules) {
    const origRules = dependencyRules.slice();
    dependencyRules.splice(0);
    const newRules = origRules.filter(([ property, refProperties ]) => {
      return !(property === path || refProperties.includes(path));
    });
    dependencyRules.push(...newRules);
    this.#isUpdate = true;
  }

  getReferedProperties(property, map = this.#map) {
    const node = map.get(property);
    const walk = (node, todo) => {
      if (node == null) return todo;
      todo.add(node.name);
      node.parentNodes.forEach(parentNode => {
        todo = walk(parentNode, todo);
      });
      return todo;
    };
    return walk(node, new Set([property]));
  }

  clearUpdate() {
    this.#isUpdate = false;
  }

  get isUpdate() { return this.#isUpdate; }
}