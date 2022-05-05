
const context = {};
class AppViewModel {
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

export default { AppViewModel, context };