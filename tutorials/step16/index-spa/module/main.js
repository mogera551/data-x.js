
class AppViewModel {
  "@@name" = "";
  get "isEmpty"() {
    return !this["name"];
  };

  onClickRegist() {
    alert("regist !!!");
  }
}

const dependencyRules = [
  ["isEmpty", ["name"]],
]

export default { AppViewModel, dependencyRules };