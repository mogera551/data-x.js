class AppViewModel {
  "@show#get"() {
    return this.$content === "content2";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }