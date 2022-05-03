const STORAGE_KEY = "members";

export class Member {
  name = "";
  age = "";
  address = { postalcode:"", prefecture:"", city:"", address:"" };
  phone = "";
  static create() {
    return new Member();
  }
}

export class Members extends Array {
  load() {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    this.splice(0);
    this.push(...list);
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this));
  }
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.splice(0);
  }
}
