1.コンテクスト
コンテクストを使ってブロック内の状態を参照する。
主に、
・ループを展開する際のインデックスの参照
・ユーティリティ呼び出し（ダイアログ表示、更新通知）
で使用する

ViewModelClass内では、this.$contextで参照できる

class ViewModelClass {
  get "names.*"() {
    const { $1 } = this.$context.indexes; // ループ展開時のインデックス参照
    return this["names"][$1];
  }
  get "values.*.*"() {
    const { $1, $2 } = this.$context.indexes; // ループ展開時のインデックス参照
    return this["values"][$1][$2];
  }
}

context変数をViewModelClassクラスの外部で定義し、コンテクストとすることができる
export defaultにcontext変数を含む必要がある

const context = {};
class ViewModelClass {
  get "names.*"() {
    const { $1 } = context.indexes; // ループ展開時のインデックス参照
    return this["names"][$1];
  }
  get "values.*.*"() {
    const { $1, $2 } = context.indexes; // ループ展開時のインデックス参照
    return this["values"][$1][$2];
  }
}

export default { ViewModelClass, context }

2.ループ展開
リストなどの繰り返し構造を表現する
2-1.HTML要素のループの書き方

<template data-x:loop="list">
  <div data-x:bind="list.*">
</template>

templateタグ内に繰り返す要素を記述する
data-x:loop属性にループするviewModelのプロパティを入れる
繰り返す要素のバインドは、list.*のようにドット記法で記述し、繰り返す部分はワイルドカード(*)とする

2-2.ViewModelのループの書き方
ループするプロパティ("list.*")を定義する
アクセサプロパティは、コンテクストからインデックスを取得し、listから対応する要素を返す

class ViewModelClass {
  $$list = [10, 20, 30];
  get "list"() { return this.$$list; }
  get "list.*"() {
    const $1 = this.$context.$1;
    return this["list"][$1];
  }
}