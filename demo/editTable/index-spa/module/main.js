const context = {};
class AppViewModel {
  "@members#init" = data => { 
    data.members.load();
    return context.notifiable(data.members); 
  };

  "@@members.*.name";
  "@@members.*.age";
  "@@members.*.address.postalcode";
  "@@members.*.address.prefecture";
  "@@members.*.address.city";
  "@@members.*.address.address";
  "@@members.*.phone";

  "#eventClickDelete" = ([, $1]) => {
    if (!confirm("削除しますか？")) return;
    this.members.splice($1, 1);
  };
  "#eventClickAdd" = () => { 
    this.members.push(this.members.createMember()); 
  };
  "#eventClickSave" = () => {
    if (!confirm("保存しますか？")) return;
    this.members.save();
  }; 
  "#eventClickClear" = () => {
    if (!confirm("クリアしますか？")) return;
    this.members.clear();
  };
}

export default { AppViewModel, context }
