const context = {};
class AppViewModel {
  "@show#get" = () => this.$content === "users";
  "@@users#get" = () => this.$userList.getUsers();
  "@users.*.id";
  "@users.*.name";
  "@users.*.email";

  "@@eventClickTd#set" = ([event, $1]) => context.inquiryAll("edit", this[`users.${$1}.id`]);
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "users", [ "$content" ] ],
];

export default { AppViewModel, context, dependencyRules };
