
0.最小構成と変数の出力（片方向バインディング）
1.フォルダ構成

ANY.html メインとなるhtml
ANY-spa/
ANY-spa/css/ cssファイルを格納
ANY-spa/html/ htmlファイルを格納
ANY-spa/module/ javascriptファイルを格納

※ANYは、メインとなるhtmlの拡張子を除いた部分
　例
　　main.htmlの場合SPAフォルダは、main-spaとなる

2.メインとなるhtml
2-1.ANY-spa/フォルダと同じ階層に配置
2-2.ブロックをロードするためのHTML要素を書く

<div data-x:block="ブロック名"></div>

※ブロックは、spaを管理するための単位で、
　ブロック名.css、ブロック名.html、ブロック名.js
　で構成され、それぞれ、ANY-spa/css、ANY-spa/html、ANY-spa/module
  に格納する。

2-3.フレームワークを実行するためのコードを記述
App.jsをimportして、App.boot()を実行

<script>
import App from "path/to/data-x/App.js";

App.boot();
</script>

3.ブロックの作成
3-1.htmlファイル
名前は、ブロック名.html
HTML要素のdata-x:bind属性にバインドするViewModelのプロパティを書く
※ViewModelのmessageプロパティの内容がHTML要素のtextContentへ反映される

<div data-x:bind="message"></div>

3-2.JSファイル
名前は、ブロック名.js
ViewModelクラスの定義を書く

class ViewModelClass {
  get message() { return "welcome to data-x.js"; }
}

※バインドできるのは、アクセサプロパティ（get/setを持つプロパティ）のみ

ViewModelクラスをエクスポートする

export default { ViewModelClass };

