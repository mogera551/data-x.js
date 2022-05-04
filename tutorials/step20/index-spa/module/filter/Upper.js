import Filters from "../../../../../src/Filter/Filters.js"

Filters.regist("@upper", {
  forward(value, options = []) {
    return value?.toUpperCase() ?? "";
  }
});
