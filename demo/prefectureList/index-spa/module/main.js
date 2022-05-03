const context = {};
class ViewModelClass {
  "@@prefectures#init" = async data => await fetch(data.apiGetList).then(response => response.json());
  "@prefectures.*.no#get" = () => Number(context.$1) + 1;
  "@prefectures.*.name";
  "@prefectures.*.capital";
  "@prefectures.*.population";
  "@prefectures.*.sharePopulation#get" = () => Math.floor(this["prefectures.*.population"] / this["sumPopulation"] * 10000) / 100;
  "@sumPopulation#get" = () => this["prefectures"].reduce((sum, pref) => sum + pref.population, 0);
}

export default { ViewModelClass, context }