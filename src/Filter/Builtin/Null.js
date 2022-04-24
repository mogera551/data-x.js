import Filters from "../Filters.js"

Filters.regist("null", {
  forward(value) {
    return value == null;
  }
});
