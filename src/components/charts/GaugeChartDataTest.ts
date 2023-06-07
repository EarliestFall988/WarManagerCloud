import { type ReactEChartsProps } from "./React-Echarts";

const GaugeOption: ReactEChartsProps["option"] = {
  series: [
    {
      type: "gauge",
      center: ["50%", "60%"],
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 120,
      splitNumber: 5,
      itemStyle: {
        color: "#eebb22",
      },
      progress: {
        show: true,
        width: 30,
      },

      pointer: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          width: 30,
        },
      },
      axisTick: {
        distance: -45,
        splitNumber: 5,
        lineStyle: {
          width: 2,
          color: "#bbb",
        },
      },
      splitLine: {
        distance: -52,
        length: 18,
        lineStyle: {
          width: 3,
          color: "#bbb",
        },
      },
      axisLabel: {
        distance: -20,
        color: "#bbb",
        fontSize: 20,
      },
      anchor: {
        show: false,
      },
      title: {
        show: false,
      },
      detail: {
        valueAnimation: true,
        width: "60%",
        lineHeight: 20,
        borderRadius: 8,
        offsetCenter: [0, "-15%"],
        fontSize: 25,
        fontWeight: "normal",
        formatter: "{value}",
        color: "inherit",
      },
      data: [
        {
          value: 50,
        },
      ],
    },

    // {
    //   type: "gauge",
    //   center: ["50%", "60%"],
    //   startAngle: 200,
    //   endAngle: -20,
    //   min: 0,
    //   max: 60,
    //   itemStyle: {
    //     color: "#FD7347",
    //   },
    //   progress: {
    //     show: true,
    //     width: 8,
    //   },

    //   pointer: {
    //     show: false,
    //   },
    //   axisLine: {
    //     show: false,
    //   },
    //   axisTick: {
    //     show: false,
    //   },
    //   splitLine: {
    //     show: false,
    //   },
    //   axisLabel: {
    //     show: false,
    //   },
    //   detail: {
    //     show: false,
    //   },
    //   data: [
    //     {
    //       value: 50,
    //     },
    //   ],
    // },
  ],
};

export default GaugeOption;
