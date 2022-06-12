class AppViewModel {
  "@show#get"() {
    return this.$content === "content1";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }