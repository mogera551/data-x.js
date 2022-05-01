import Filters from "../../../../../src/Filter/Filters.js"

Filters.regist("@upper", {
  forward(value) {
    return value?.toUpperCase() ?? "";
  }
});
