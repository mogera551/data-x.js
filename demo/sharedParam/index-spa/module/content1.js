class AppViewModel {
  "@show#get" = () => this.$content === "content1";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }