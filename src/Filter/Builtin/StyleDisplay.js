import Filters from "../Filters.js"

Filters.regist("style-display", {
  forward(value, options = []) {
    return value ? "" : "none";
  },
  backward(value, options = []) {
    return value === "none" ? false : true;
  }
});
