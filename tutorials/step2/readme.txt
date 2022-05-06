1.双方向バインディング
inputなどの入力可能なHTML要素からviewModelのプロパティへ値を反映する

1-1.ブロック、htmlファイル
入力可能なHTML要素を配置
そのHTML要素のname属性にバインドするViewModelのプロパティを書くと、
HTML要素のvalueとViewModelのプロパティがバインドされる

<input type="text" name="message">
<div data-x:bind="message"></div>

※<div>は、messageの内容確認用

1-2.ブロック、JSファイル
アクセサメソッドsetを定義する
値を保存するためのデータプロパティ__messageを用意する

class ViewModel {
  __message = "welcome to data-x.js";
  get message() { return this.__message; }
  set message(value) { this.__message = value; }
}

