class ViewModelClass {
  "@@member#init" = async (data) => fetch(data.url).then(response => response.json());
  "@@member.name";
  "@@member.age";
  "@@member.address.postalcode";
  "@@member.address.prefecture";
  "@@member.address.city";
}

export default { ViewModelClass };