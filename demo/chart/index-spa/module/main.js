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

  "@labels#init"() {
    return context.notifiable(["red", "green", "blue"]);
  }
  "@values#init"() {
    return context.notifiable([33, 55, 11]);
  }
  "@datas#get"() {
    return Array(this.labels.length).fill(undefined);
  }
  "@datas.*.label#get"($1) {
    return this.labels[$1];
  }
  "@datas.*.value#get"($1) {
    return this.values[$1];
  } 

  "@@label" = "";
  "#clickAddItem"() {
    this.labels.push(this.label);
    this.values.push(Math.floor(Math.random() * 100));
    this.label = "";
    this.chart.update();
  }
  "#clickDeleteItem"(e, $1) {
    this.labels.splice($1, 1);
    this.values.splice($1, 1);
    this.chart.update();
  }
  "#init"() {
    context.registProcess(() => this.initChart());
  }
}

const dependencyRules = [
  [ "datas", [ "labels", "values" ] ],
];

export default { AppViewModel, context, dependencyRules }
