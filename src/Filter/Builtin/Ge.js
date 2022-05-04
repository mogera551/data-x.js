import Filters from "../Filters.js"

Filters.regist("ge", {
  forward(value, options = []) {
    return Number(value) >= Number(options[0] ?? 0);
  }
});
