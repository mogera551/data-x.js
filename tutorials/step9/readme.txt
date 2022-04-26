1.ViewModelのアクセサプロパティの省略記法（ドットを含むプロパティで双方向の場合）

class ViewModelClass {
  "@@member.name";
}

"@@ドットを含むプロパティ名"をViewModelクラスで定義すると、下記のように展開される

class ViewModelClass {
  get "member.name"() { return this["member"]["name"]; };
  set "member.name"(value) { this["member"]["name"] = value; };
}
