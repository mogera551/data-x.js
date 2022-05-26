const lints = [
  { name:"ESLint", state:false },
  { name:"Prettier", state:false },
  { name:"LintStagedFiles", state:false },
  { name:"StyleLint", state:false },
  { name:"Commitlint", state:false },
];

class AppViewModel {
  "@@price" = 100;
  "@@priceWithTax#get" = () => this.price * 1.1;
  "@@priceWithTax#set" = value => this.price = value / 1.1;

  "@@all#get" = () => this.lints.every(lint => lint.state);
  "@@all#set" = value => this.lints.forEach((lint, i) => this[`lints.${i}.state`] = value);

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
