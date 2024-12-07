import React, { useRef, useEffect } from "react";
import { init, getInstanceByDom } from "echarts";
import type { CSSProperties } from "react";
import type { EChartsOption, ECharts, SetOptionOpts } from "echarts";

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: "light" | "dark";
  width?: string;
  height: number;
}

export function ReactECharts({
  option,
  style,
  settings,
  loading,
  theme,
  width,
  height,
}: ReactEChartsProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null);

  // const { data } = api.projects.projectManHoursRangeCount.useQuery({
  //   startDate: new Date(Date.now()),
  //   endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
  // });

  // useEffect(() => {
  //   console.log("manhours data", data);
  // }, [data]);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }

    // Add chart resize listener
    // ResizeObserver is leading to a bit janky UX
    function resizeChart() {
      chart?.resize();
    }
    window.addEventListener("resize", resizeChart);

    // Return cleanup function
    return () => {
      chart?.dispose();
      window.removeEventListener("resize", resizeChart);
    };
  }, [theme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      if (!chart) throw new Error("chart is null");
      chart.setOption(option, settings);
    }
  }, [option, settings, theme]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      if (!chart) throw new Error("chart is null");
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true ? chart.showLoading() : chart.hideLoading();
    }
  }, [loading, theme]);

  return (
    <div
      className={`${
        width ? width : "w-full"
      } b flex min-w-[90vw] items-center rounded-sm p-1 lg:min-w-fit`}
    >
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: `${height ? (height * 50).toString() : "300"}px`,
          ...style,
        }}
      />
    </div>
  );
}
