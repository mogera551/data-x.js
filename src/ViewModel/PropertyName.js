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
    const replacer = () => tmpIndexes.shift();
    return pattern.replaceAll("*", replacer);
  }

  static createByName(name) {
    return new PropertyName({ name });
  }

  static createByPatternIndexes(pattern, indexes) {
    return new PropertyName({ pattern, indexes });
  }
}
