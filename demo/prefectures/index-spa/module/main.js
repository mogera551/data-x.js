const context = {};
class AppViewModel {
  "@regions#get" = () => Array.from(new Set(this.$prefectures.map(pref => pref.region)));
  "@regions.*";
  
  "@@region" = "";
  
  "@prefectures#get" = () => this.$prefectures.filter((pref) => this.region ? this.region === pref.region : true);
  "@prefectures.*.no#get" = () => Number(context.$1) + 1;
  "@prefectures.*.name";
  "@prefectures.*.capital";
  "@prefectures.*.population";
  "@prefectures.*.share#get" = () => this["prefectures.*.population"] / this.sumPopulation * 100;
  
  "@sumTitle#get" = () => this.region ? `${this.region}合計`: "全国合計";
  "@sumPopulation#get" = () => this.prefectures.reduce((sum, pref) => sum + pref.population, 0);
}

const dependencyRules = [
  [ "prefectures", [ "region" ] ],
  [ "sumTitle", [ "region" ] ],
  [ "sumPopulation", [ "prefectures" ] ],
];

export default { AppViewModel, dependencyRules, context }