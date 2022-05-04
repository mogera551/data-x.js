import Filters from "../Filters.js"

Filters.regist("gt", {
  forward(value, options = []) {
    return Number(value) > Number(options[0] ?? 0);
  }
});
