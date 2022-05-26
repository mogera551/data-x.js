const context = {};
class AppViewModel {
  "@show#get" = () => this.$content === "edit";

  "@@user";
  "@user.id";
  "@@user.name";
  "@@user.email";

  "#eventInquiryAll" = ([message, userId]) => {
    if (message !== "edit") return context.symbols["suspend"];
    const {id, name, email} = this.$userList.getUser(userId);
    this.user = {id, name, email};
    this.$content = "edit";
  };

  "#eventClickOk" = () => {
    this.$userList.setUser(this.user);
    this.$content = "users";
  };

  "#eventClickCancel" = () => this.$content = "users";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "user.id", [ "user" ] ],
  [ "user.name", [ "user" ] ],
  [ "user.email", [ "user" ] ],
];

export default { AppViewModel, dependencyRules, context };
