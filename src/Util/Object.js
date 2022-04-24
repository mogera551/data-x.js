const symGetByPath = Symbol();
const symSetByPath = Symbol();

Object.prototype[symGetByPath] = function (path) {
  let object = this;
  for(const name of path.split(".")) {
    object = object[name];
  }
  return (object === this) ? null : object;
}

Object.prototype[symSetByPath] = function (path, value) {
  let object = this;
  let lastObject = null;
  let lastName = null;
  for(const name of path.split(".")) {
    lastObject = object;
    lastName = name;
    object = object[name];
  }
  if (lastObject != null && lastName != null) {
    lastObject[lastName] = value;
  }
}

export { symGetByPath, symSetByPath };
