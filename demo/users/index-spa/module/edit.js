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

  "#eventClickOk"() {
    this.$userList.setUser(this.user);
    this.$content = "users";
  };

  "#eventClickCancel"() {
    return this.$content = "users";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "user", [ "$user" ] ],
];

export default { AppViewModel, dependencyRules };
