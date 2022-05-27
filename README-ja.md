# data-x.js

## シンプルで簡単なJavaScriptフレームワーク

## 特徴

* 直感的に使えるよう、覚えることを極力少なく
* 宣言的に記述できる
* MVVMを採用し、双方向バインディングを行える
* ブロック管理を採用し、SPA開発を行いやすく
* SPA開発では、HTML、CSS、JSの分離を行い、協業しやすく
* 追加ライブラリ不要
* ES2012/2022の積極採用

### 直感的に使えるよう、覚えることを極力少なく
* importを極力減らす。
* ショートハンドで簡単に。
* フレームワークのルールをわかりやすくする。

トップのhtmlは、data-x.jsを読み込み、ブロック（main）を表示するhtmlを作成する。
```html:index.html
<script src="/path/to/data-x.js"></script>

<div data-x:block="main"></div>
```

ブロック（main）の定義は、ViewModelクラスとテンプレートとなるhtmlを定義し、exportするだけ。
importは必要なし。
```JS:main.js
class AppViewModel {
  "@message" = "welcome to data-x.js";
}

const html = `
<div data-x:bind="message"></div>
`;

export default { AppViewModel, html, css:"" }
```

### 宣言的に記述できる
ViewModelクラスにアクセサプロパティを使用することで、宣言的な記述を実現。
配列表現もアスタリスク（\*）を用いて宣言的に記述。

"@@region"、"@prefs"、"@prefs.\*.name"は、アクセサプロパティ
```JS
const prefectures = [
  { name:"北海道", region:"北海道" },
  { name:"青森", region:"東北" },
    :
  { name:"香川県", region:"四国" },
  { name:"徳島県", region:"四国" },
  { name:"愛媛県", region:"四国" },
  { name:"高知県", region:"四国" },
    :
];
class AppViewModel {
  "@@region" = "四国"; // 選択した地方

  // 選択した地方（region）に一致する都道府県の一覧を取得
  "@prefs#get" = () => prefectures.find(pref => pref.region === this.region);
  
  // 都道府県一覧（配列）の名前プロパティをアスタリスクを含むドット記法で表現
  "@prefs.*.name";
}

const html = `
<template data-x:loop="prefs">
  <div data-x:bind="prefs.*.name"></div>
</template>
`;

```

```html:region === '四国'の出力例
<div>香川県</div>
<div>徳島県</div>
<div>愛媛県</div>
<div>高知県</div>
```

バインドルールを宣言的に記述でき、分離して管理できる。
html要素のデザイン上不要となる属性の肥大を抑え、デザイナーとの協業をやりやすくする。

```html
<style data-x:rules="bind">
.message {
  --bind-textContent: message;
}
</style>

<div class="message"></div>
```

### MVVMを採用し、双方向バインディングを行える
ViewModelクラスのプロパティに書き込み可（プロパティを@@で始める）にし、
入力要素に、バインドするプロパティを割り当てる

```JS:main.js
class AppViewModel {
  "@@value" = "";
}

const html = `
<input type="text" name="value">
<div data-x:bind="value"></div>
`;

export default { AppViewModel, html, css:"" }
```

### ブロック管理を採用し、SPA開発を行いやすく
html要素をグルーピングし、ブロック管理を行うことで
管理を局所化し、煩雑になりがちなSPA管理をやりやすくする。

### SPA開発では、HTML、CSS、JSの分離を行い、協業しやすく
HTML、CSS、JSを分離し、協業しやすくし、
バインドルールを分離することで、属性汚染を軽減する。

### 追加ライブラリ不要
data-x.jsをインポートするだけの簡単な設計。

### ES2012/2022の積極採用
IEはサポートしません。


