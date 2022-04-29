1.ViewModelのアクセサプロパティの省略記法（ループの場合）

class ViewModelClass {
  "@list" = [10, 20, 30];
  "@list.*";
}

"@@ワイルドカードを含むプロパティ名"をViewModelクラスで定義すると、下記のように展開される

class ViewModelClass {
  $$list = [10, 20, 30];
  get "list"() { return this.$$list; }
  get "list.*"() {
    const $1 = this.$context.$1;
    return this["list"][$1];
  }
}
