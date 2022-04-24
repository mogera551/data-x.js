export default class Filters {
  static filterByName = new Map();

  static regist(name, filter) {
    this.filterByName.set(name, filter);
  }

  static forward(filterNames, value) {
    filterNames.map(filterName => this.filterByName.get(filterName)).forEach(filter => {
      value = ("forward" in filter) ? filter.forward(value) : value;
    });
    return value;
  }

  static backward(filterNames, value) {
    filterNames.map(filterName => this.filterByName.get(filterName)).forEach(filter => {
      value = ("backward" in filter) ? filter.backward(value) : value;
    });
    return value;
  }
}
