1.ViewModelのアクセサプロパティの省略記法（ドットを含むプロパティの場合）

class AppViewModel {
  "@member.name";
}

"@ドットを含むプロパティ名"をViewModelクラスで定義すると、下記のように展開される

class AppViewModel {
  get "member.name"() { return this["member"]["name"]; };
}

３階層ある場合

class AppViewModel {
  "@member.address.postalcode";
}

class AppViewModel {
  get "member.address.postalcode"() { return this["member.address"]["postalcode"]; };
}

2.ドットを含むプロパティのアクセサプロパティの補完

下記のような場合、

class AppViewModel {
  "@member" = member;
  "@member.address.postalcode";
}

@member.addressが補完される

class AppViewModel {
  "@member" = member;
  "@member.address";
  "@member.address.postalcode";
}
