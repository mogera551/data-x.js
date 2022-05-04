import Filters from "../Filters.js"

Filters.regist("locale-string", {
  forward(value, options = []) {
    return Number(value).toLocaleString();
  }
});
