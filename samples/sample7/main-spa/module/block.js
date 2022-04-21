class ViewModelClass {
  "@@message" = "";
  get "emptyMessage"() {
    return (this["message"] ?? "").length == 0;
  }

  onClickRegist() {
    alert(`regist message "${this["message"]}"`);
  }
}

const dependencyRules = [
  ["emptyMessage", ["message"]]
];

export default { ViewModelClass, dependencyRules }