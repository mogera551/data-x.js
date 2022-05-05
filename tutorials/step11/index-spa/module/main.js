
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

class AppViewModel {
  "@fruits" = fruits;
  "@fruits.*";
}

export default { AppViewModel };