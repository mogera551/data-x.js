class ViewModelClass {
  "@@member";
  "@@member.name";
  "@@member.age";
  "@@member.address.postalcode";
  "@@member.address.prefecture";
  "@@member.address.city";
  "@@eventInit#set" = function(args) {
    const data = args[0];
    this["member"] = data.member;
  }
}

export default { ViewModelClass };