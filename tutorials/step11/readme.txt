1.ViewModelのアクセサプロパティの省略記法（ループの場合）

class AppViewModel {
  "@list" = [10, 20, 30];
  "@list.*";
}

"@ワイルドカードを含むプロパティ名"をViewModelクラスで定義すると、下記のように展開される

class AppViewModel {
  __list = [10, 20, 30];
  get "list"() { return this.__list; }
  get "list.*"() {
    const $1 = this.$context.$1;
    return this["list"][$1];
  }
}
