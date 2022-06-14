class AppViewModel {
  "@show#get"() {
    return this.$content === "users";
  }
  
  "@users#get"() {
    return this.$userList.getUsers();
  }
  "@users.*.id";
  "@users.*.name";
  "@users.*.email";

  "#clickTd"(event, $1) {
    this.$user = this.$userList.getUser(this.users[$1].id);
    this.$content = "edit";
  }
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "users", [ "show" ] ],
];

export default { AppViewModel, dependencyRules };
