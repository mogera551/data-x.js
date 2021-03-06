import Filters from "./Filters.js"

Filters.regist("falsey", {
  forward(value, options = []) {
    return !(value);
  }
});

Filters.regist("not", {
  forward(value, options = []) {
    return !value;
  }
});

Filters.regist("null", {
  forward(value, options = []) {
    return value == null;
  }
});

Filters.regist("style-display", {
  forward(value, options = []) {
    return value ? "" : "none";
  }
});

Filters.regist("locale-string", {
  forward(value, options = []) {
    return Number(value).toLocaleString();
  }
});

Filters.regist("fixed", {
  forward(value, options = []) {
    return Number(value).toFixed(options[0] ?? 0);
  }
});

Filters.regist("ge", {
  forward(value, options = []) {
    return Number(value) >= Number(options[0] ?? 0);
  }
});

Filters.regist("gt", {
  forward(value, options = []) {
    return Number(value) > Number(options[0] ?? 0);
  }
});

Filters.regist("le", {
  forward(value, options = []) {
    return Number(value) <= Number(options[0] ?? 0);
  }
});

Filters.regist("lt", {
  forward(value, options = []) {
    return Number(value) < Number(options[0] ?? 0);
  }
});

Filters.regist("number-value", {
  forward(value, options = []) {
    return value?.toString() ?? "";
  },
  backward(value, options = []) {
    return (value !== "") ? Number(value) : null;
  },
});

Filters.regist("b64", {
  forward(value, options = []) {
    return atob(value);
  },
  backward(value, options = []) {
    return btoa(value);
  },
});
