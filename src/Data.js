export default class Data {
  static data = {};
  static setData(data) {
    Object.assign(this.data, data);
  }
}