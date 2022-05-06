1.オブジェクトの双方向バインド
2.ViewModelの書き方

値を入れるためのアクセサメソッドを追加する

class AppViewModel {
  __member = member;
  get "member"() { return this.__member; }
  get "member.name"() { return this["member"]["name"]; }
  set "member.name"(value) { this["member"]["name"] = value; }
  get "member.age"() { return this["member"]["age"]; }
  set "member.age"(value) { this["member"]["age"] = value; }
  get "member.address"() { return this["member"]["address"]; }
  get "member.address.postalcode"() { return this["member.address"]["postalcode"]; }
  set "member.address.postalcode"(value) { this["member.address"]["postalcode"] = value; }
  get "member.address.prefecture"() { return this["member.address"]["prefecture"]; }
  set "member.address.prefecture"(value) { this["member.address"]["prefecture"] = value; }
  get "member.address.city"() { return this["member.address"]["city"]; }
  set "member.address.city"(value) { this["member.address"]["city"] = value; }
}
