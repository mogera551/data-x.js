const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

const context = {};
class AppViewModel {
  "@fruits#init"() {
    return context.notifiable(fruits);
  };
  "@fruits.*";
  "@@newFruits" = "";
  "@isEmpty#get"() {
    return !this["newFruits"];
  }
  "#clickAdd"(event) {
    this["fruits"].push(this["newFruits"]);
    this["newFruits"] = "";
  }
}

const dependencyRules = [
  ["isEmpty", ["newFruits"]],
//  ["fruits", ["eventClickAdd"]],
];

export default { AppViewModel, dependencyRules, context }