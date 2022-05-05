
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

const context = {};
class AppViewModel {
  $$fruits = fruits;
  get "fruits"() { return this.$$fruits; }
  get "fruits.*"() {
    const { $1 } = this.$context;
    return this["fruits"][$1];
  }
  set "fruits.*"(value) {
    const { $1 } = context;
    return this["fruits"][$1] = value;
  }
}

export default { AppViewModel, context };