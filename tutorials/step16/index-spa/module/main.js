
class AppViewModel {
  "@@name" = "";
  "@isEmpty#get"() {
    return !this["name"];
  };

  "#clickRegist"() {
    alert("regist !!!");
  }
}

const dependencyRules = [
  ["isEmpty", ["name"]],
]

export default { AppViewModel, dependencyRules };
