import Options from "../Options.js"
import "./Builtin.js";
import Filters from "./Filters.js"

class Filter {
  static async registLocalFilter(localFilter = Options.localFilter, filterPath = Options.filterPath) {
    if (localFilter) {
      const index = document.baseURI.lastIndexOf("/");
      const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
      const filters = await import(/* webpackIgnore: true */`${base}${filterPath}/filters.js`);
      filters.default.forEach(info => {
        Filters.regist(info.name, info.filter);
      })
    }
  }
}

export default Filter;