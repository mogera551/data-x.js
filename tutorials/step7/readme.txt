1.ViewModelのアクセサプロパティの省略記法（ドットを含むプロパティの場合）

class ViewModelClass {
  "@member.name";
}

"@ドットを含むプロパティ名"をViewModelクラスで定義すると、下記のように展開される

class ViewModelClass {
  get "member.name"() { return this["member"]["name"]; };
}

３階層ある場合

class ViewModelClass {
  "@member.address.postalcode";
}

class ViewModelClass {
  get "member.address.postalcode"() { return this["member.address"]["postalcode"]; };
}

2.ドットを含むプロパティのアクセサプロパティの補完

下記のような場合、

class ViewModelClass {
  "@member" = member;
  "@member.address.postalcode";
}

@member.addressが補完される

class ViewModelClass {
  "@member" = member;
  "@member.address";
  "@member.address.postalcode";
}
