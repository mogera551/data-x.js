
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

class ViewModelClass {
  $$fruits = fruits;
  get "fruits"() { return this.$$fruits; }
  get "fruits.*"() {
    const { $1 } = this.$context;
    return this["fruits"][$1];
  }
}

export default { ViewModelClass };