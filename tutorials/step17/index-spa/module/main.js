
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

const context = {};
class AppViewModel {
  "@fruits" = fruits;
  "@fruits.*";
  "@@newFruits" = "";
  get "isEmpty"() {
    return !this["newFruits"];
  }
  onClickAdd(event) {
    this["fruits"].push(this["newFruits"]);
    this["newFruits"] = "";
    context.notify("fruits");
  }
}

const dependencyRules = [
  ["isEmpty", ["newFruits"]],
];

export default { AppViewModel, dependencyRules, context }