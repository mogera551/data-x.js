import Filters from "../Filters.js"

Filters.regist("not", {
  forward(value) {
    return !value;
  },
  backward(value) {
    return !value;
  }
});
