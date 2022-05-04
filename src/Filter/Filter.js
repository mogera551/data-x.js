import Filters from "./Filters.js";
import "./Builtin.js";
import App from "../App.js"

async function registLocalFilter() {
  if (App.options.localFilter) {
    const index = document.baseURI.lastIndexOf("/");
    const base = (index >= 0) ? document.baseURI.slice(0, index + 1) : "";
    await import(`${base}${App.options.filterPath}/regist.js`);
  }
}
await registLocalFilter();

export default Filters;