
const context = {};
class AppViewModel {
  "@members#init" = data => { 
    data.members.load();
    (data.members.length == 0) && data.members.push(data.members.createMember());
    return data.members; 
  };
  "@@members.*.name";
  "@@members.*.age";
  "@@members.*.address.postalcode";
  "@@members.*.address.prefecture";
  "@@members.*.address.city";
  "@@members.*.address.address";
  "@@members.*.phone";
  "@memberCount#get" = () => this["members"].length;

  "@@eventClickDelete#set" = () => {
    if (!confirm("削除しますか？")) return false;
    this["members"].splice(context.$1, 1);
  };
  "@@eventClickAdd#set" = () => { 
    this["members"].push(this["members"].createMember()); 
  };
  "@@eventClickSave#set" = () => {
    if (!confirm("保存しますか？")) return false;
    this["members"].save();
  }; 
  "@@eventClickClear#set" = () => {
    if (!confirm("クリアしますか？")) return false;
    this["members"].clear();
    this["members"].push(this["members"].createMember());
  };
}

const dependencyRules = [
  [ "members", [ "eventClickDelete" ] ],
  [ "members", [ "eventClickAdd" ] ],
  [ "members", [ "eventClickSave" ] ],
  [ "members", [ "eventClickClear" ] ],
];
export default { AppViewModel, context, dependencyRules }