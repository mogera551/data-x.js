const context = {};
class AppViewModel {
  "@@chart";
  initChart() {
    const canvas = context.rootElement.getElementById('chart').getContext('2d');
    this.chart = new Chart( canvas, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [ { label: 'example', data: this.values, }, ],
      },
    } );
  };

  "@labels" = ["red", "green", "blue"];
  "@values" = [33, 55, 11];

  "@datas#get" = () => Array(this.labels.length).fill(undefined);
  "@datas.*.label#get" = () => this.labels[context.$1];
  "@datas.*.value#get" = () => this.values[context.$1];

  "@@label" = "";
  "#eventClickAddItem" = () => {
    this.labels.push(this.label);
    this.values.push(Math.floor(Math.random() * 100));
    this.label = "";
    this.chart.update();
  }
  "#eventClickDeleteItem" = ([, $1]) => {
    this.labels.splice($1, 1);
    this.values.splice($1, 1);
    this.chart.update();
  }
  "#eventInit" = () => {
    context.postUpdate(() => this.initChart());
  }
}

const dependencyRules = [
  [ "datas", [ "eventClickAddItem", "eventClickDeleteItem" ] ],
];

export default { AppViewModel, context, dependencyRules }