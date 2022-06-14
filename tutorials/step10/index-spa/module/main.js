
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

const context = {};
class AppViewModel {
  __fruits = fruits;
  get "fruits"() { return this.__fruits; }
  get "fruits.*"() {
    const { $1 } = context;
    return this["fruits"][$1];
  }
}

export default { AppViewModel, context };
