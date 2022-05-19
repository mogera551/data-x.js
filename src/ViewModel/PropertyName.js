export default class PropertyName {
  name;
  pattern;
  indexes;
  lastName;
  parentName;
  constructor({ name = null, pattern = null, indexes = null }) {
    this.name = name;
    this.pattern = pattern;
    this.indexes = indexes;
    if (name == null && pattern != null && indexes != null) {
      this.name = PropertyName.expand(pattern, indexes);
    }
    const elements = this.name.split(".");
    this.lastName = elements.pop();
    this.parentName = elements.join(".");
  }

  static expand(pattern, indexes, tmpIndexes = indexes.slice()) {
    let fail = false;
    const replacer = () => tmpIndexes.shift() ?? (fail = true, "*");
    const result = pattern.replaceAll("*", replacer);
    return fail ? null : result;
  }

  static createByName(name) {
    return new PropertyName({ name });
  }

  static createByPatternIndexes(pattern, indexes) {
    return new PropertyName({ pattern, indexes });
  }
}
