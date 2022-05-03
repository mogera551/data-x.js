import Filters from "../Filters.js"

Filters.regist("locale-string", {
  forward(value) {
    return Number(value).toLocaleString();
  }
});
