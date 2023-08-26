import { type NextPage } from "next";
import { DashboardMenu } from "~/components/dashboardMenu";
import { TitleBar } from "../activity";
// import BarChartOption from "~/components/charts/BarChartDataTest";
import { ReactECharts } from "../../../charts/ManHoursMonthlyChartComponent";
import useManHoursDataChart from "../../../charts/ManHoursMonthlyBarChart";


export const StatsPage: NextPage = () => {
  const options = useManHoursDataChart(6);

  return (
    <main className="flex h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="h-[93vh] w-full">
        <div className="flex h-16 w-full items-center justify-between p-2 backdrop-blur">
          <TitleBar />
        </div>
        <div className="h-full w-full overflow-auto p-2">
          <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
            <p>Estimated Man Hours</p>
          </div>
          <div className="h-[20vh]">
            <ReactECharts option={options} width="w-full" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default StatsPage;
