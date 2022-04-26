
0.イベント処理

1.イベント
HTML要素のdata-x:eventsにイベント名を記述
※buttonの場合clickイベントが自動的に設定される
name属性に識別名を入れる

<button name="regist">regist</button>
<div data-x:events="dblclick">double click here</div>

2.イベントハンドラの作成
ViewModelクラスにイベントハンドラを作成する

イベントハンドラの名前は、
on + イベント名 + 識別名
※イベント名は、最初が大文字
※識別名は、最初が大文字
　name属性の値をとる。name属性がない場合、tagName

class ViewModelClass {
    // イベントハンドラ
    onClickRegist() {
        alert("click regist button");
    }
    onDblclickDiv() {
        alert("double click div");
    }
}
