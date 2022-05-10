const context = {};
class AppViewModel {
  "@show#get" = () => this.$content === "users";
  
  "@users#get" = () => this.$userList.getUsers();
  "@users.*.id";
  "@users.*.name";
  "@users.*.email";

  "#eventClickTd" = () => context.inquiryAll("edit", this["users.*.id"]);
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "users", [ "$content" ] ],
];

export default { AppViewModel, context, dependencyRules };
