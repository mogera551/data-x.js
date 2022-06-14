class AppViewModel {
  "@show#get"() {
    return this.$content === "edit";
  }

  "@user#get"() {
    return Object.assign({}, this.$user);
  }
  "@user.id";
  "@@user.name";
  "@@user.email";

  "#clickOk"() {
    this.$userList.setUser(this.user);
    this.$content = "users";
  };

  "#clickCancel"() {
    return this.$content = "users";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "user", [ "$user" ] ],
];

export default { AppViewModel, dependencyRules };
