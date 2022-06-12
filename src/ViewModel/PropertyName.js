export default class PropertyName {
  static expand(pattern, indexes, tmpIndexes = indexes.slice()) {
    let fail = false;
    const replacer = () => tmpIndexes.shift() ?? (fail = true, "*");
    const result = pattern.replaceAll("*", replacer);
    return fail ? null : result;
  }
}
