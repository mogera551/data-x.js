import Filters from "../Filter/Filters.js"

export default class Filter {
  static parse(string) {
    return (string.length == 0) ? [] : string.split("|")
      .map(filterExpr => filterExpr.split(":"))
      .map(([ name, optionDesc]) => ({ name, options:optionDesc?.split(";") ?? [], filter:Filters.filterByName.get(name) }));
  }
}