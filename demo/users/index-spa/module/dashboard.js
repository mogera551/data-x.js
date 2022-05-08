class AppViewModel {
  "@show#get" = () => this.$content === "dashboard";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules };
