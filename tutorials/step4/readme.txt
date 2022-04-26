
1.ViewModelのアクセサプロパティの省略記法

class ViewModel {
  "@@message" = "welcome to data-x.js";
}

"@@プロパティ名"をViewModelクラスで定義すると、下記のように展開される
* 値を格納するデータプロパティ$$message
* $$messageを参照するアクセサプロパティ(get)message
* $$messageに値を設定するアクセサプロパティ(set)message
が作成される
双方向バインディングで使用
※"@@プロパティ名"は必ずダブルクォーテーションで括る必要がある

class ViewModel {
  $$message = "welcome to data-x.js";
  get message() { return this.$$message; }
  set message(value) { this.$$message = value; }
}

