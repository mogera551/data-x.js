class ViewModelClass {
  "@@message" = "";
  get "emptyMessage"() {
    return (this["message"] ?? "").length == 0;
  }
}

const dependencyRules = [
  ["emptyMessage", ["message"]]
];

export default { ViewModelClass, dependencyRules }