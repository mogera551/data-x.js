
class AppViewModel {
  "@@eventClickDashboard#set" = () => this.$content = "dashboard";
  "@@eventClickUsers#set" = () => this.$content = "users";
}

export default { AppViewModel };
