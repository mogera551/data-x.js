export default class Filters {
  static filterByName = new Map();

  static regist(name, filter) {
    this.filterByName.set(name, filter);
  }

  static forward(filterDescs, value) {
    return filterDescs.map(filterDesc => {
      const [name, optDesc] = filterDesc.split(":");
      const options = (optDesc ?? "").split(";");
      const filter = this.filterByName.get(name);
      return { name, options, filter }
    }).reduce((value, { options, filter }) => ("forward" in filter) ? filter.forward(value, options) : value, value)
  }

  static backward(filterDescs, value) {
    return filterDescs.map(filterDesc => {
      const [name, optDesc] = filterDesc.split(":");
      const options = (optDesc ?? "").split(";");
      const filter = this.filterByName.get(name);
      return { name, options, filter }
    }).reduce((value, { options, filter }) => ("backward" in filter) ? filter.backward(value, options) : value, value)
  }
}
