const URL_API = "https://api.zipaddress.net/";

class AppViewModel {
  "@@inputZip"  = "";
  "@zipcode#get" = () => /^[0-9]{7}$/.test(this.inputZip) ? this.inputZip : null;
  "@address#get" = async() => {
    if (this.zipcode == null) return "";
    const params = new URLSearchParams({ zipcode: this.zipcode });
    return fetch(`${URL_API}?${params}`)
      .then(response => response.json())
      .then(json => json.code === 200 ? json.data.fullAddress : json.message);
  }
  "@message#get" = async() => {
    const text = await this.address;
    if (!text) return;
    return `検索結果は、「${text}」です。`;
  }
}

const dependencyRules = [
  [ "zipcode", ["inputZip"] ],
  [ "address", ["zipcode"] ],
  [ "message", ["address"] ],
];

export default { AppViewModel, dependencyRules }