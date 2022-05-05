class AppViewModel {
  $$message = "welcome to data-x.js";
  get message() { return this.$$message; }
  set message(value) { this.$$message = value; }
}

export default { AppViewModel };