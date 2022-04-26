
const fruits = [
  "apple",
  "banana",
  "orange",
  "strawberry",
];

class ViewModelClass {
  "@fruits" = fruits;
  "@fruits.*";
}

export default { ViewModelClass };