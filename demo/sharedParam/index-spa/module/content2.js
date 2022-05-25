class AppViewModel {
  "@show#get" = () => this.$content === "content2";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }