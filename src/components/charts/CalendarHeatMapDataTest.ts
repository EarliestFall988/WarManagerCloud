import { type ReactEChartsProps } from "./React-Echarts";

import * as echarts from "echarts/core";

function getVirtualData(year: string) {
  const date = +echarts.time.parse(year + '-01-01');
  const end = +echarts.time.parse(year + '-12-31');
  const dayTime = 3600 * 24 * 1000;
  const data: [string, number][] = [];
  for (let time = date; time <= end; time += dayTime) {
    data.push([
      echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
      Math.floor(Math.random() * 10000)
    ]);
  }
  return data;
}


const CalendarHeatMapOption: ReactEChartsProps["option"] = {
  visualMap: {
    show: false,
    min: 0,
    max: 10000
  },
  calendar: {
    range: '2017'
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: getVirtualData('2017')
  }
};

export default CalendarHeatMapOption;
