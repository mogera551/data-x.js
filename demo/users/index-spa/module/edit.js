class AppViewModel {
  "@show#get" = () => this.$content === "edit";

  "@user#get" = () => Object.assign({}, this.$user);
  "@user.id";
  "@@user.name";
  "@@user.email";

  "#eventClickOk" = () => {
    this.$userList.setUser(this.user);
    this.$content = "users";
  };

  "#eventClickCancel" = () => this.$content = "users";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "user", [ "$user" ] ],
];

export default { AppViewModel, dependencyRules };
