import Filters from "./Filters.js"

Filters.regist("falsey", {
  forward: value => !(value),
});

Filters.regist("not", {
  forward: value => !value,
});

Filters.regist("null", {
  forward: value => value == null,
});

Filters.regist("nullable", {
  forward: value => value ?? "",
});

Filters.regist("style-display", {
  forward: value => value ? "" : "none",
});

Filters.regist("locale-string", {
  forward: value => Number(value).toLocaleString(),
});

Filters.regist("fixed", {
  forward: (value, options = []) => Number(value).toFixed(options[0] ?? 0),
});

Filters.regist("eq", {
  forward: (value, options = []) => Number(value) === Number(options[0] ?? 0),
});

Filters.regist("ge", {
  forward: (value, options = []) => Number(value) >= Number(options[0] ?? 0),
});

Filters.regist("gt", {
  forward: (value, options = []) => Number(value) > Number(options[0] ?? 0),
});

Filters.regist("le", {
  forward: (value, options = []) => Number(value) <= Number(options[0] ?? 0),
});

Filters.regist("lt", {
  forward: (value, options = []) => Number(value) < Number(options[0] ?? 0),
});

Filters.regist("number-value", {
  forward: value => value?.toString() ?? "",
  backward: value => value !== "" ? Number(value) : null,
});

Filters.regist("b64", {
  forward: value => atob(value),
  backward: value => btoa(value),
});

Filters.regist("unit", {
  forward: (value, options = []) => `${value}${options[0] ?? ""}`,
  backward: (value, options = []) => {
    if (options[0] == null) {
      return value;
    } else {
      const re = new RegExp(`^(.*)(${options[0]})$`);
      const results = re.exec(value);
      return (results != null) ? results[1].trim() : value;
    }
  },
});
