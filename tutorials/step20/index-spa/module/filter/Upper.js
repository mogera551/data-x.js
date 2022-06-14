export default {
  name: "@upper",
  filter: {
    forward(value, options = []) {
      return value?.toUpperCase() ?? "";
    }
  }
}
