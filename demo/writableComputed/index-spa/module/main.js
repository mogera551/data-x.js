const lints = [
  { name:"ESLint", state:false },
  { name:"Prettier", state:false },
  { name:"LintStagedFiles", state:false },
  { name:"StyleLint", state:false },
  { name:"Commitlint", state:false },
];

class AppViewModel {
  "@@price" = 100;
  "@@priceWithTax#" = {
    "get": function () {
      return this.price * 1.1
    },
    "set": function (value) {
      return this.price = value / 1.1
    },
  };

  "@@all#" = {
    "get": function () {
      return this.lints.every(lint => lint.state);
    },
    "set": function(value) {
      return this.lints.forEach((lint, i) => this[`lints.${i}.state`] = value);
    },
  };

  "@lints" = lints;
  "@lints.*.name";
  "@@lints.*.state";
}

const dependencyRules = [
  [ "priceWithTax", [ "price" ] ],
  [ "price", [ "priceWithTax" ] ],

  [ "all", [ "lints.*.state" ] ],
];

export default { AppViewModel, dependencyRules }
