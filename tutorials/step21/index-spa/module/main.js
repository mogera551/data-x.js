class AppViewModel {
  "@@member";
  "@@member.name";
  "@@member.age";
  "@@member.address.postalcode";
  "@@member.address.prefecture";
  "@@member.address.city";
  onInit(data) {
    this["member"] = data.member;
  }
}

export default { AppViewModel };