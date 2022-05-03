const context = {};
class ViewModelClass {
  "@@prefectures#init" = async data => await fetch(data.apiGetList).then(response => response.json());
  "@prefectures.*.no#get" = () => Number(context.$1) + 1;
  "@prefectures.*.name";
  "@prefectures.*.capital";
  "@prefectures.*.population";
}

export default { ViewModelClass, context }