class AppViewModel {
  "@contents" = [ "content1", "content2", "content3" ];
  "@contents.*";
  "@contents.*.selected#get" = () => this["contents.*"] === this.$content;

  "#eventClickMenuItem" = ([, $1]) => this.$content = this.contents[$1];
}

const dependencyRules = [
  [ "contents", [ "$content" ] ],
];

export default { AppViewModel, dependencyRules }
