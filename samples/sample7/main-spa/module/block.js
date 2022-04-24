class ViewModelClass {
  "@@message" = "";

  onClickRegist() {
    alert(`regist message "${this["message"]}"`);
  }
}

export default { ViewModelClass }