const URL_API = "https://api.zipaddress.net/";
const context = {};
class AppViewModel {
  "@members#init" = data => context.notifiable(data.members.load());

  "@@members.*.name";
  "@@members.*.age";
  "@@members.*.address.postalcode#set" = async value => {
    const { $1 } = context;
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

  "#eventClickDelete" = ([, $1]) => confirm("削除しますか？") && this.members.splice($1, 1);
  "#eventClickAdd" = () => this.members.push(this.members.createMember()); 
  "#eventClickSave" = () => confirm("保存しますか？") && this.members.save();
  "#eventClickClear" = () => confirm("クリアしますか？") && this.members.clear();
}

export default { AppViewModel, context }
