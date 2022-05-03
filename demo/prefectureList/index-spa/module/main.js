const context = {};
class ViewModelClass {
  "@prefectures#init" = async data => await fetch(data.apiGetList).then(response => response.json());
  "@prefectures.*.no#get" = () => Number(context.$1) + 1;
  "@prefectures.*.name";
  "@prefectures.*.capital";
  "@prefectures.*.population";
  "@prefectures.*.sharePopulation#get" = () => this["prefectures.*.population"] / this["sumPopulation"] * 100;
  "@sumPopulation#get" = () => this["prefectures"].reduce((sum, pref, i) => sum + this[`prefectures.${i}.population`], 0);
}

export default { ViewModelClass, context }