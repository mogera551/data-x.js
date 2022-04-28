
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

class ViewModelClass {
  "@fruits" = fruits;
  "@fruits.*";
  "@@newFruits" = "";
  get "isEmpty"() {
    return !this["newFruits"];
  }
  set "eventClickAdd"(event) {
    this["fruits"].push(this["newFruits"]);
    this["newFruits"] = "";
  }
}

const dependencyRules = [
  ["isEmpty", ["newFruits"]],
  ["fruits", ["eventClickAdd"]],
];

export default { ViewModelClass, dependencyRules }