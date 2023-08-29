import { api } from "~/utils/api";
import { type ReactEChartsProps } from "./ManHoursMonthlyChartComponent";
import { useMemo, useState } from "react";

type ratingType = {
  sectorName: string;
  avgProfitabilityRating: number;
  avgCustomerRating: number;
  avgSafetyRating: number;
  avgQualityRating: number;
  avgStaffingRating: number;
};

const useCompanyRatingsRadar = () => {
  const { data } = api.projects.projectAverageRatings.useQuery();

  const [ratings, setRatings] = useState<ratingType[]>([]);
  const [xAxisData, setXAxisData] = useState<{ name: string; max: number }[]>(
    []
  );

  useMemo(() => {
    if (data === undefined) return;
    // console.log("data", data);

    setRatings(data);
    setXAxisData(
      ["Profitability", "Customer", "Safety", "Quality", "Staffing"].map(
        (item) => {
          return {
            name: item,
            max: 10,
          };
        }
      )
    );
  }, [data]);

  const RadarChartOption: ReactEChartsProps["option"] = {
    legend: {
      // data: xAxisData,
      textStyle: {
        color: "#ccc",
        backgroundColor: "#0000",
        padding: [2, 5],
        borderRadius: 2,
      },

      data: ratings.map((item) => item.sectorName),
    },
    tooltip: {
      valueFormatter(value) {
        let v = value.toString();

        if (v.length > 4) {
          v = v.substring(0, 4);
        }

        return v + "/10";
      },
    },
    radar: {
      shape: "circle",
      indicator: xAxisData,
      splitArea: {
        show: true,
        areaStyle: {
          opacity: 0.25,
        },
      },
      splitLine: {
        lineStyle: {
          color: "#555",
          cap: "round",
          miterLimit: 3,
          type: "dashed",
        },
      },
      axisLine: {
        lineStyle: {
          color: "#888",
          width: 1,
          type: "solid",
        },
      },
    },
    series: [
      {
        name: "Sectors",
        type: "radar",
        data: ratings.map((item) => {
          return {
            name: item.sectorName,
            value: [
              item.avgProfitabilityRating,
              item.avgCustomerRating,
              item.avgSafetyRating,
              item.avgQualityRating,
              item.avgStaffingRating,
            ],
          };
        }),
      },
    ],
  };

  return RadarChartOption;
};

export default useCompanyRatingsRadar;
