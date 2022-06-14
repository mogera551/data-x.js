
0.イベント処理

1.イベント
HTML要素のdata-x:eventsにイベント名を記述
※buttonの場合clickイベントが自動的に設定される
data-x:name属性もしくは、name属性に識別名を入れる

<button name="regist">regist</button>
<div data-x:events="dblclick">double click here</div>
<div data-x:name="here" data-x:events="dblclick">double click here</div>
<button name="cancel">cancel</button>

2.イベントハンドラの作成
ViewModelクラスにイベントハンドラもしくはイベントプロパティを作成する

イベントハンドラの名前は、
"#" + イベント名 + 識別名
※識別名は、最初が大文字
　data-x:name属性もしくは、name属性の値をとる。ない場合、tagName

class AppViewModel {
    // イベントハンドラ
    "#clickRegist"() {
        alert("click regist button");
    }
    "#dblclickDiv"() {
        alert("double click div");
    }
    "#dblclickHere"() {
        alert("double click here");
    }
    "#clickCancel"(event) {
        alert("click cancel button");
    }

}
