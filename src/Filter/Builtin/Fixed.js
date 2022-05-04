import Filters from "../Filters.js"

Filters.regist("fixed", {
  forward(value, options = []) {
    return Number(value).toFixed(options[0] ?? 0);
  }
});
