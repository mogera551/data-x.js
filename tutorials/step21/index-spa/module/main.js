class AppViewModel {
  "@@member";
  "@@member.name";
  "@@member.age";
  "@@member.address.postalcode";
  "@@member.address.prefecture";
  "@@member.address.city";
  "#init"(data) {
    this.member = data.member;
  }
}

export default { AppViewModel };
