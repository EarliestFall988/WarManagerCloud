import { api } from "~/utils/api";
import { type ReactEChartsProps } from "./ManHoursMonthlyChartComponent";

import { useMemo, useState } from "react";
import { type ManHourResult } from "~/server/api/routers/projects";

type sectorData = {
  name: string;
  id: string;
  result: ManHourResult[];
};

const useManHoursDataChart = (monthCount: number) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [projectData, setProjectData] = useState<sectorData[] | undefined>([]);
  const [xAxisData, setXAxisData] = useState<string[]>([]);

  useMemo(() => {
    setStartDate(new Date());

    const endDate = new Date();

    if (monthCount === 0) {
      throw new Error("Month count cannot be 0");
    }

    if (endDate.getMonth() + monthCount >= 11) {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setMonth(endDate.getMonth() + monthCount - 11);
    }

    setEndDate(endDate);
  }, [monthCount]);

  const { data } = api.projects.projectManHoursRangeCount.useQuery({
    monthCount,
  });

  useMemo(() => {
    setProjectData([]);

    data?.map((item) => {
      setProjectData((prev) => {
        if (prev === undefined) return;
        return [
          ...prev,
          {
            name: item.name,
            id: item.id,
            result: item.result,
          },
        ];
      });
    });
  }, [data]);

  console.log(projectData); 

  useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const i = startDate;
    const xAxisData = [] as string[];
    while (i <= endDate) {
      const xData = months[i.getMonth()];
      if (xData !== undefined) {
        xAxisData.push(xData);
      }

      if (i.getMonth() === 11) {
        i.setFullYear(i.getFullYear() + 1);
        i.setMonth(0);
      } else {
        i.setMonth(i.getMonth() + 1);
      }
    }

    setXAxisData(xAxisData);
  }, [endDate, startDate]);

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
      data: projectData?.map((item) => item.name),
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
          type: ["line", "bar"],
        },
        dataView: {
          backgroundColor: "#000",
        },
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
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: "#333",
          type: "dashed",
        },
      },
    },
    series: projectData?.map((item, index) => {
      return {
        type: "bar",
        emphasis: {
          focus: "series",
        },
        animationEasing: "cubicInOut",
        animationDelay: function (idx: number) {
          return idx * 50 + index * 50;
        },
        name: item.name,
        data: item.result.map((item) => item.manHourCount),
      };
    }),
    animationDelayUpdate: function (idx) {
      return idx * 50;
    },
  };

  return BarChartOption;
};

export default useManHoursDataChart;
