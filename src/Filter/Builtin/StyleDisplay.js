import Filters from "../Filters.js"

Filters.regist("style-display", {
  forward(value) {
    return value ? "" : "none";
  },
  backward(value) {
    return value === "none" ? false : true;
  }
});
