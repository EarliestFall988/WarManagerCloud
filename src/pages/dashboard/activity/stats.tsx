import { type NextPage } from "next";
import { DashboardMenu } from "~/components/dashboardMenu";
import { TitleBar } from "../activity";
// import BarChartOption from "~/components/charts/BarChartDataTest";
import { ReactECharts } from "../../../charts/ManHoursMonthlyChartComponent";
import useManHoursDataChart from "../../../charts/ManHoursMonthlyBarChart";
import useCrewMemberRatingBySectorDataChart from "~/charts/CrewMemberRatingBySector";
import useCompanyRatingsRadar from "~/charts/CompanyRatingsRadar";
import { api } from "~/utils/api";
import Link from "next/link";
// import useCompanyMedianRatingsRadar from "~/charts/CompanyMedianRatingsGauge";

export const StatsPage: NextPage = () => {
  const options = useManHoursDataChart(6);
  const crewRatingOptions = useCrewMemberRatingBySectorDataChart();
  const companyRatingsRadar = useCompanyRatingsRadar();
  // const medianRatings = useCompanyMedianRatingsRadar();

  const { data, isLoading, isError } = api.projects.getBurnRate.useQuery();

  return (
    <main className="flex h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="h-[93vh] w-full">
        <div className="flex h-16 w-full items-center justify-between p-2 backdrop-blur">
          <TitleBar />
        </div>
        <div className="h-full w-full overflow-auto p-2">
          <div className="">
            <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
              <p>Projected Man Hours</p>
            </div>
            <ReactECharts option={options} height={6} width="w-full" />
          </div>
          <div className="py-10">
            <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
              <p>Crew Ratings By Sector</p>
            </div>
            <ReactECharts
              option={crewRatingOptions}
              height={8}
              width="w-full"
            />
          </div>
          <div className="flex w-full flex-wrap items-center justify-around">
            <div className="w-1/2 py-10">
              <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
                <p>Average Ratings By Sector</p>
              </div>
              <ReactECharts
                option={companyRatingsRadar}
                height={8}
                width="w-full"
              />
            </div>
            {/* <div className="w-1/2 py-10">
              <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
                <p>Median Company Ratings</p>
              </div>
              <ReactECharts option={medianRatings} height={10} width="w-full" />
            </div> */}
          </div>
          <div className="flex w-full flex-wrap items-center justify-around">
            <div className="w-1/2 py-10">
              {data && (
                <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-zinc-600 p-10">
                  <div className="flex w-full items-center justify-center p-2 text-lg font-semibold">
                    <p>Average Overall Labor Cost</p>
                  </div>
                  <div className="flex w-full items-center justify-center p-2 text-[5em] font-semibold">
                    <p>
                      {data} <span className="text-2xl">($$/project)</span>
                    </p>
                  </div>
                  <div className="pt-11">
                    <Link
                      href="https://valkyrie-git-get-functions-from-server-earliestfall988.vercel.app/jobs/clq0exhkz000059xwukxig1wz/instructions"
                      className="w-60 cursor-pointer rounded bg-zinc-800 p-3 text-lg font-semibold transition duration-200 hover:bg-amber-600"
                      target="_blank"
                    >
                      View Procedure
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="py-36" />
        </div>
      </div>
    </main>
  );
};

export default StatsPage;
