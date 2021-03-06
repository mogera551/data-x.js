const URL_API = "https://api.zipaddress.net/";

class AppViewModel {
  "@@inputZip"  = "";
  "@zipcode#get"() {
    return /^[0-9]{7}$/.test(this.inputZip) ? this.inputZip : null;
  }
  async "@address#get"() {
    if (this.zipcode == null) return "";
    const params = new URLSearchParams({ zipcode: this.zipcode });
    return fetch(`${URL_API}?${params}`)
      .then(response => response.json())
      .then(json => json.code === 200 ? json.data.fullAddress : json.message);
  }
  async "@message#get"() {
    const address = await this.address;
    return address ? `検索結果は、「${address}」です。` : "";
  }
}

const dependencyRules = [
  [ "zipcode", ["inputZip"] ],
  [ "address", ["zipcode"] ],
  [ "message", ["address"] ],
];

export default { AppViewModel, dependencyRules }