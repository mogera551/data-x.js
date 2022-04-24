import Filters from "../Filters.js"

Filters.regist("falsey", {
  forward(value) {
    return !(value);
  }
});
