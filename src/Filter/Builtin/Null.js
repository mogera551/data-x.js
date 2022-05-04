import Filters from "../Filters.js"

Filters.regist("null", {
  forward(value, options = []) {
    return value == null;
  }
});
