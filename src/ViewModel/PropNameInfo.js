export default class PropNameInfo {
  name;
  parent;
  last;
  loops;
  privateName;
  isPath;
  isPattern;
  isPrimitive;
  static get(name) {
    const info = new PropNameInfo();
    info.name = name;
    const hasPeriod = name.includes(".");
    const hasAsterisk = name.includes("*");
    info.isPath = hasPeriod && !hasAsterisk;
    info.isPattern = hasPeriod && hasAsterisk;
    info.isPrimitive = !info.isPath && !info.isPattern;
    if (info.isPath || info.isPattern) {
      const elements = name.split(".");
      info.last = elements.pop();
      info.parent = elements.join(".");
    }
    if (info.isPattern) {
      info.loops = name.split("").filter(c => c === "*").length;
    }
    if (info.isPrimitive) {
      info.privateName = `__${name}`;
    }
    return info;
  }
}
