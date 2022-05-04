import Filters from "../Filters.js"

Filters.regist("not", {
  forward(value, options = []) {
    return !value;
  },
  backward(value, options = []) {
    return !value;
  }
});
