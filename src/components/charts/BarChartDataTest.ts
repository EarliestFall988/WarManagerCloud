import { type ReactEChartsProps } from "./React-Echarts";

// const xAxisData = [];
const data1 = [0, 4, 12, 25, 29, 51, 2, 25, 9, 11, 54, 15, 0];
// const data2 = [];
// for (let i = 0; i < 100; i++) {
//   xAxisData.push('A' + i.toString());
//   data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
//   data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
// }

const xAxisData = [
  "Submittal Phase",
  "Start 90+ Days",
  "Start 60 Days",
  "Start 30 Days",
  "Start 2 Weeks",
  "In Progress: Good",
  "In Progress: Bad",
  "Awaiting Phase 2",
  "JR Punch List",
  "MF Punch List",
  "Closeout Phase",
  "100% Complete",
  "Legal",
];

const BarChartOption: ReactEChartsProps["option"] = {
  title: {
    text: "All Jobs",
  },
  legend: {
    data: ["Jobs", "bar2"],
  },
  toolbox: {
    // y: 'bottom',
    feature: {
      magicType: {
        type: ["stack"],
      },
      dataView: {},
      saveAsImage: {
        pixelRatio: 2,
      },
    },
  },
  tooltip: {},
  xAxis: {
    data: xAxisData,
    splitLine: {
      show: false,
    },
  },
  yAxis: {},
  series: [
    {
      name: "Jobs",
      type: "bar",
      data: data1,
      emphasis: {
        focus: "series",
      },
      animationDelay: function (idx) {
        return idx * 100;
      },
    },
    // {
    //   name: 'bar2',
    //   type: 'bar',
    //   data: data2,
    //   emphasis: {
    //     focus: 'series'
    //   },
    //   animationDelay: function (idx) {
    //     return idx * 10 + 100;
    //   }
    // }
  ],
  animationEasing: "cubicOut",
  animationDelayUpdate: function (idx) {
    return idx * 5;
  },
};

export default BarChartOption;
