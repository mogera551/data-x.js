
const context = {};
class AppViewModel {
  __name = "";
  get "name"() { return this.__name; }
  set "name"(value) { 
    this.__name = value;
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