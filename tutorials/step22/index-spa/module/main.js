class AppViewModel {
  "@@member";
  "@@member.name";
  "@@member.age";
  "@@member.address.postalcode";
  "@@member.address.prefecture";
  "@@member.address.city";
  async "#init"(data) {
    const response = await fetch(data.url);
    const json = await response.json();
    this.member = json;
  }
}

export default { AppViewModel };
