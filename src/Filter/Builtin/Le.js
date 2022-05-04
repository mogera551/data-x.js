import Filters from "../Filters.js"

Filters.regist("le", {
  forward(value, options = []) {
    return Number(value) <= Number(options[0] ?? 0);
  }
});
