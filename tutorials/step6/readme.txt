
1.オブジェクトのバインド
2.HTML要素のバインドの書き方

オブジェクト名.メンバー名
オブジェクト名.メンバー名.メンバー名
"."で区切る（ドット記法）

<span data-x:bind="member.name"></span>
<span data-x:bind="member.age"></span>
<span data-x:bind="member.address.postalcode"></span>
<span data-x:bind="member.address.prefecture"></span>
<span data-x:bind="member.address.city"></span>

2.ViewModelの書き方

const member = {
  name: "Yamada Taro",
  age: 36,
  address: {
    postalcode: "100-0001",
    prefecture: "Tokyo",
    city: "Chiyoda-ku",
  }
}

プロパティ名はドット記法のまま（""で括る）
アクセサメソッド内でプロパティを参照する場合、ブラケット記法で行う

class AppViewModel {
  $$member = member;
  get "member"() { return this.$$member; }
  get "member.name"() { return this["member"]["name"]; }
  get "member.age"() { return this["member"]["age"]; }
  get "member.address"() { return this["member"]["address"]; }
  get "member.address.postalcode"() { return this["member.address"]["postalcode"]; }
  get "member.address.prefecture"() { return this["member.address"]["prefecture"]; }
  get "member.address.city"() { return this["member.address"]["city"]; }
}

export default { AppViewModel }