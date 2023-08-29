import { api } from "~/utils/api";
import { type ReactEChartsProps } from "./ManHoursMonthlyChartComponent";

import { useMemo, useState } from "react";

// type data = {
//   name: string;
//   id: string;
//   avg: number;
//   data: {
//     rating: number;
//     amount: number;
//   }[];
// };

type sectorDataLayer = {
  name: string;
  data: number[];
};

const useCrewMemberRatingBySectorDataChart = () => {
  // const [crewData, setCrewData] = useState<data[]>([]);
  const [sectorDatalayers, setSectorDatalayers] = useState<sectorDataLayer[]>(
    []
  );
  const [xAxisData, setXAxisData] = useState<string[]>([]);

  const { data } = api.crewMembers.crewMemberPerformanceBySector.useQuery();

  useMemo(() => {
    // setCrewData([]);
    setSectorDatalayers([]);

    if (data === undefined) return;

    const d = data.data;
    const layers = data.layers;

    const result = d.filter((item) => item !== undefined || item !== null);
    // setCrewData(result);

    const sectorLayers = layers.filter(
      (item) => item !== undefined || item !== null
    );
    setSectorDatalayers(sectorLayers);

    setXAxisData(result.map((item) => item.name + " rating"));
  }, [data]);

  // const xAxisData = [] as string[];

  // data?.map((item) => {
  //   xAxisData.push(months[item.month] || "");
  // });

  // const data2 = [];
  // for (let i = 0; i < 100; i++) {
  //   xAxisData.push('A' + i.toString());
  //   data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
  // }

  const BarChartOption: ReactEChartsProps["option"] = {
    legend: {
      // data: xAxisData,
      textStyle: {
        color: "#ccc",
        backgroundColor: "#0000",
        padding: [2, 5],
        borderRadius: 2,
      },
    },
    toolbox: {
      // y: 'bottom',
      feature: {
        magicType: {
          type: ["bar", "stack"],
        },
        dataView: {
          backgroundColor: "#000",
        },
        saveAsImage: {
          pixelRatio: 2,
        },
      },
    },
    dataZoom: [
      {
        type: "inside",
      },
    ],
    tooltip: {
      valueFormatter(value) {
        if (value !== undefined && value !== null)
          return value.toString() + " people";
        return "0 people";
      },
    },
    xAxis: {
      // data: xAxisData,
      // show: false,
      // deduplication: true,
      show: true,
      splitLine: {
        show: true,
        lineStyle: {
          color: "#555",
          type: "solid",
        },
      },
    },
    yAxis: {
      data: xAxisData,
      splitLine: {
        show: true,
        lineStyle: {
          color: "#333",
          type: "dashed",
        },
      },
    },
    series: sectorDatalayers?.map((item, index) => {
      return {
        type: "bar",
        name: [
          "0 rating",
          "1 rating",
          "2 rating",
          "3 rating",
          "4 rating",
          "5 rating",
          "6 rating",
          "7 rating",
          "8 rating",
          "9 rating",
          "10 rating",
        ][index],
        stack: "x",
        emphasis: {
          focus: "series",
        },
        label: {
          show: true,
          position: "insideLeft",
          valueAnimation: true,
          verticalAlign: "middle",
        },
        animationEasingUpdate: "sinusoidalInOut",
        animationDelayUpdate: function (idx: number) {
          return idx * 100 + (10 - index * 50) + 100;
        },
        data: item.data,
      };
    }),
    animationThreshold: 100,
    animationEasingUpdate: "backInOut",
    animationDelayUpdate: function (idx) {
      return idx * 100;
    },
  };

  return BarChartOption;
};

export default useCrewMemberRatingBySectorDataChart;
