import { Members, Member } from "../../models/Members.js" 

const context = {};
class ViewModelClass {
  "@members#init" = async () => { 
    const members = new Members; 
    members.load();
    (members.length == 0) && members.push(Member.create());
    return members; 
  };
  "@@members.*.name";
  "@@members.*.age";
  "@@members.*.address.postalcode";
  "@@members.*.address.prefecture";
  "@@members.*.address.city";
  "@@members.*.address.address";
  "@@members.*.phone";

  "@@eventClickDelete#set" = args => {
    const [event, $1] = args;
    if (confirm("削除しますか？")) {
      this["members"].splice($1, 1);
      context.notify("members"); 
    }
  };
  "@@eventClickAdd#set" = event => { 
    this["members"].push(Member.create()); 
    context.notify("members"); 
  };
  "@@eventClickSave#set" = event => {
    if (confirm("保存しますか？")) {
      this["members"].save();
    } 
  }; 
  "@@eventClickClear#set" = event => {
    if (confirm("クリアしますか？")) {
      this["members"].clear();
      this["members"].push(Member.create());
      context.notify("members"); 
    } 
  }; 
}

export default { ViewModelClass, context }