const URL_API = "https://api.zipaddress.net/";
const context = {};
class AppViewModel {
  "@members#init"(data) {
    return context.notifiable(data.members.load());
  }

  "@@members.*.name";
  "@@members.*.age";
  async "@@members.*.address.postalcode#set"(value, $1) {
    this[`members.${$1}.address`]["postalcode"] = value;
    if (value == "" || !/^[0-9]{7}$/.test(value)) return;
    const params = new URLSearchParams({ zipcode: value });
    const response = await fetch(`${URL_API}?${params}`);
    const json = await response.json();
    if (json.code === 200) {
      this[`members.${$1}.address.prefecture`] = json.data.pref;
      this[`members.${$1}.address.city`] = json.data.city;
      this[`members.${$1}.address.address`] = json.data.town;
    }
  };
  "@@members.*.address.prefecture";
  "@@members.*.address.city";
  "@@members.*.address.address";
  "@@members.*.phone";

  "#clickDelete"(event, $1) {
    confirm("削除しますか？") && this.members.splice($1, 1);
  }
  "#clickAdd"() {
    this.members.push(this.members.createMember());
  }
  "#clickSave"() {
    confirm("保存しますか？") && this.members.save();
  }
  "#clickClear"() {
    confirm("クリアしますか？") && this.members.clear();
  }
}

export default { AppViewModel, context }
