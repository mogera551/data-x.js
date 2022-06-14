export default {
  name: "@lower",
  filter: {
    forward(value, options = []) {
      return value?.toLowerCase() ?? "";
    }
  }
}
