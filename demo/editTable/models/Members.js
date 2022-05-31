const STORAGE_KEY = "members";

export class Member {
  name = "";
  age = 0;
  address = { postalcode:"", prefecture:"", city:"", address:"" };
  phone = "";
}

export class Members extends Array {
  load() {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    this.splice(0);
    this.push(...list);
    return this;
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this));
    return this;
  }
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.splice(0);
    return this;
  }
  createMember() {
    return new Member();
  }
}

const members = new Members;
export default members;
