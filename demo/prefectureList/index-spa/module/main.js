const context = {};
class ViewModelClass {
  "@prefectures#init" = async data => await fetch(data.apiGetList).then(response => response.json());
  "@prefectures.*.region";

  "@regions#get" = () => Array.from(new Set(this["prefectures"].map((p, i) => this[`prefectures.${i}.region`])));
  "@regions.*";
  
  "@@chosenRegion" = "";
  
  "@filteredPrefectures#get" = () => this["prefectures"].filter((p, i) => this["chosenRegion"] ? this["chosenRegion"] === this[`prefectures.${i}.region`] : true);
  "@filteredPrefectures.*.no#get" = () => Number(context.$1) + 1;
  "@filteredPrefectures.*.name";
  "@filteredPrefectures.*.capital";
  "@filteredPrefectures.*.population";
  "@filteredPrefectures.*.sharePopulation#get" = () => this["filteredPrefectures.*.population"] / this["sumPopulation"] * 100;
  
  "@sumPopulation#get" = () => this["filteredPrefectures"].reduce((sum, p, i) => sum + this[`filteredPrefectures.${i}.population`], 0);
  "@sumTitle#get" = () => this["chosenRegion"] ? `${this["chosenRegion"]}合計`: "全国合計";
}

const dependencyRules = [
  [ "filteredPrefectures", [ "chosenRegion" ] ],
  [ "sumPopulation", [ "chosenRegion" ] ],
  [ "sumTitle", [ "chosenRegion" ] ],
];

export default { ViewModelClass, dependencyRules, context }