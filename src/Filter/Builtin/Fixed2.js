import Filters from "../Filters.js"

Filters.regist("fixed2", {
  forward(value) {
    return Number(value).toFixed(2);
  }
});
