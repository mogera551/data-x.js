
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
on + イベント名 + 識別名
※イベント名は、最初が大文字
※識別名は、最初が大文字
　data-x:name属性もしくは、name属性の値をとる。ない場合、tagName

イベントプロパティは、アクセサ(set)プロパティとして作成する
イベントプロパティの名前は、
event + イベント名 + 識別名
※イベント名、識別名はイベントハンドラの命名に従う

class ViewModelClass {
    // イベントハンドラ
    onClickRegist() {
        alert("click regist button");
    }
    onDblclickDiv() {
        alert("double click div");
    }
    onDblclickHere() {
        alert("double click here");
    }
    
    // イベントプロパティ
    set "eventClickCancel"(event) {
        alert("click cancel button");
    }

}
