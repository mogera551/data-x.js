
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

const context = {};
class ViewModelClass {
  $$fruits = fruits;
  get "fruits"() { return this.$$fruits; }
  get "fruits.*"() {
    const { $1 } = context;
    return this["fruits"][$1];
  }
}

export default { ViewModelClass, context };