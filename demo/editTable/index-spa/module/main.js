import members from "../../models/Members.js" 

const context = {};
class ViewModelClass {
  "@members#init" = () => { 
    members.load();
    (members.length == 0) && members.push(members.createMember());
    return members; 
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