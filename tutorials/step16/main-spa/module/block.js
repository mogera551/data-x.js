
const context = {};
class ViewModelClass {
  $$name = "";
  get "name"() { return this.$$name; }
  set "name"(value) { 
    this.$$name = value;
    context.notify("isEmpty", []);
  }
  get "isEmpty"() {
    return !this["name"];
  };

  onClickRegist() {
    alert("regist !!!");
  }
}

export default { ViewModelClass, context };