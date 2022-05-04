export default class Filters {
  static filterByName = new Map();

  static regist(name, filter) {
    this.filterByName.set(name, filter);
  }

  static forward(filters, value) {
    const exec = (info,value) => info.filter.forward(value, info.options);
    return filters.reduce((value, info) => ("forward" in info.filter) ? exec(info, value) : value, value)
  }

  static backward(filters, value) {
    const exec = (info,value) => info.filter.backward(value, info.options);
    return filters.reduce((value, info) => ("backward" in info.filter) ? exec(info, value) : value, value)
  }
}
