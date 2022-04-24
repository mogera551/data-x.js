1.双方向バインディング
inputなどのHTML要素からviewModelのプロパティへ値を反映する

1-1.ブロック、htmlファイル
入力要素を配置
入力要素は、name属性にバインドするViewModelのプロパティを書く

<input type="text" name="message">
<div data-x:bind="message"></div>

※<div>は、messageの内容確認用

1-2.ブロック、JSファイル
アクセサメソッドsetを定義する
値を保存するためのデータプロパティ$$messageを用意する

class ViewModel {
  $$message = "welcome to data-x.js";
  get message() { return this.$$message; }
  set message(value) { this.$$message = value; }
}

