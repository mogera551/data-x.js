class AppViewModel {
  "@show#get"() {
    return this.$content === "dashboard";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules };
