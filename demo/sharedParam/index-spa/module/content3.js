class AppViewModel {
  "@show#get"() {
    return this.$content === "content3";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }