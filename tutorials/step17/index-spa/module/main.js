
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
  "@isEmpty#get"() {
    return !this["newFruits"];
  }
  "#clickAdd"(event) {
    this["fruits"].push(this["newFruits"]);
    this["newFruits"] = "";
    context.notify("fruits");
  }
}

const dependencyRules = [
  ["isEmpty", ["newFruits"]],
];

export default { AppViewModel, dependencyRules, context }