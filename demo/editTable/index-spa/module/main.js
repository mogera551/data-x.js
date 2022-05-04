
const context = {};
class ViewModelClass {
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

  "@@eventClickDelete#set" = args => {
    if (confirm("削除しますか？")) {
      this["members"].splice(context.$1, 1);
      context.notify("members"); 
    }
  };
  "@@eventClickAdd#set" = args => { 
    this["members"].push(this["members"].createMember()); 
    context.notify("members"); 
  };
  "@@eventClickSave#set" = args => {
    if (confirm("保存しますか？")) {
      this["members"].save();
    } 
  }; 
  "@@eventClickClear#set" = args => {
    if (confirm("クリアしますか？")) {
      this["members"].clear();
      this["members"].push(this["members"].createMember());
      context.notify("members"); 
    } 
  };
}

export default { ViewModelClass, context }