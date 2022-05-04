import Filters from "../Filters.js"

Filters.regist("lt", {
  forward(value, options = []) {
    return Number(value) < Number(options[0] ?? 0);
  }
});
