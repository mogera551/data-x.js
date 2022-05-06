import "./Builtin.js";

class Filter {
  static async registLocalFilter(localFilter, filterPath) {
    if (localFilter) {
      const index = document.baseURI.lastIndexOf("/");
      const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
      await import(`${base}${filterPath}/regist.js`);
    }
  }
}

export default Filter;