class ViewModelClass {
  // event handler
  onClickRegist() {
    alert("click regist button");
  }
  onDblclickDiv() {
    alert("double click div");
  }
  onDblclickHere() {
    alert("double click div");
  }
  // event property
  set "eventClickCancel"(event) {
    alert("click cancel button");
  }
}

export default { ViewModelClass };