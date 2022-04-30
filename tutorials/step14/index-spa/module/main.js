
class ViewModelClass {
  "@@name" = "yamada taro";
  get "upperName"() {
    return this["name"].toUpperCase();
  };
}

const dependencyRules = [
  ["upperName", ["name"]],
]

export default { ViewModelClass, dependencyRules };