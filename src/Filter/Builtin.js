import Filters from "./Filters.js"

Filters.regist("falsey", {
  forward(value, options = []) {
    return !(value);
  }
});

Filters.regist("not", {
  forward(value, options = []) {
    return !value;
  },
  backward(value, options = []) {
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
  },
  backward(value, options = []) {
    return value === "none" ? false : true;
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

