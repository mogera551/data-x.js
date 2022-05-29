class AppViewModel {
  "@show#get" = () => this.$content === "users";
  
  "@users#get" = () => this.$userList.getUsers();
  "@users.*.id";
  "@users.*.name";
  "@users.*.email";

  "#eventClickTd" = ([,$1]) => {
    this.$user = this.$userList.getUser(this.users[$1].id);
    this.$content = "edit";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "users", [ "show" ] ],
];

export default { AppViewModel, dependencyRules };
