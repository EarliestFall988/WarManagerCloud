import { type ReactEChartsProps } from "./ManHoursMonthlyChartComponent";

const useCompanyMedianRatingsRadar = () => {
  const gaugeData = [
    {
      value: 20,
      name: "Safety",
      title: {
        offsetCenter: ["0%", "-30%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "-20%"],
      },
    },
    {
      value: 40,
      name: "Customer Satisfaction",
      title: {
        offsetCenter: ["0%", "0%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "10%"],
      },
    },
    {
      value: 60,
      name: "Profitability",
      title: {
        offsetCenter: ["0%", "30%"],
      },
      detail: {
        valueAnimation: true,
        offsetCenter: ["0%", "40%"],
      },
    },
  ];

//   setInterval(function () {
//     if (gaugeData[0] === undefined) return;

//     if (gaugeData[1] === undefined) return;

//     if (gaugeData[2] === undefined) return;

//     gaugeData[0].value = +(Math.random() * 100).toFixed(2);
//     gaugeData[1].value = +(Math.random() * 100).toFixed(2);
//     gaugeData[2].value = +(Math.random() * 100).toFixed(2);
//     myChart.setOption({
//       series: [
//         {
//           data: gaugeData,
//           pointer: {
//             show: false,
//           },
//         },
//       ],
//     });
//   }, 2000);

  const RadarChartOption: ReactEChartsProps["option"] = {
    series: [
      {
        type: "gauge",
        startAngle: 90,
        endAngle: -270,
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          overlap: false,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: "#464646",
          },
        },
        axisLine: {
          lineStyle: {
            width: 40,
          },
        },
        splitLine: {
          show: false,
          distance: 0,
          length: 10,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
          distance: 50,
        },
        data: gaugeData,
        title: {
          fontSize: 14,
        },
        detail: {
          width: 50,
          height: 14,
          fontSize: 14,
          color: "inherit",
          borderColor: "inherit",
          borderRadius: 20,
          borderWidth: 1,
          formatter: "{value}%",
        },
      },
    ],
  };

  return RadarChartOption;
};

export default useCompanyMedianRatingsRadar;
