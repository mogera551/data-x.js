class AppViewModel {
  "@show#get" = () => this.$content === "edit";

  "@@user";
  "@user.id";
  "@@user.name";
  "@@user.email";

  "@@eventInquiryAll#set" = ([message, userId]) => {
    if (message !== "edit") return false;
    const {id, name, email} = this.$userList.getUser(userId);
    this["user"] = {id, name, email};
    this.$content = "edit";
  }

  "@@eventClickOk#set" = () => {
    this.$userList.setUser(this["user"]);
    this.$content = "users";
  };

  "@@eventClickCancel#set" = () => this.$content = "users";
}

const dependencyRules = [
  [ "show", [ "$content" ] ],
  [ "user.id", [ "user" ] ],
  [ "user.name", [ "user" ] ],
  [ "user.email", [ "user" ] ],
];

export default { AppViewModel, dependencyRules };
