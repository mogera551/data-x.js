class AppViewModel {
  __message = "welcome to data-x.js";
  get message() { return this.__message; }
  set message(value) { this.__message = value; }
}

export default { AppViewModel };