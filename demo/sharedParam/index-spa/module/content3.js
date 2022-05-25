class AppViewModel {
  "@show#get" = () => this.$content === "content3";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }