import Filters from "../../../../../src/Filter/Filters.js"

Filters.regist("@lower", {
  forward(value) {
    return value?.toLowerCase() ?? "";
  }
});
