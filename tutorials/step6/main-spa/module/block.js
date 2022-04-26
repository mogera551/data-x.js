const member = {
  name: "Yamada Taro",
  age: 36,
  address: {
    postalcode: "100-0001",
    prefecture: "Tokyo",
    city: "Chiyoda-ku",
  }
}

class ViewModelClass {
  $$member = member;
  get "member"() { return this.$$member; }
  get "member.name"() { return this["member"]["name"]; }
  get "member.age"() { return this["member"]["age"]; }
  get "member.address"() { return this["member"]["address"]; }
  get "member.address.postalcode"() { return this["member.address"]["postalcode"]; }
  get "member.address.prefecture"() { return this["member.address"]["prefecture"]; }
  get "member.address.city"() { return this["member.address"]["city"]; }
}

export default { ViewModelClass }