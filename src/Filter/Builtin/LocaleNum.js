import Filters from "../Filters.js"

Filters.regist("locale-num", {
  forward(value) {
    return Number(value).toLocaleString();
  }
});
