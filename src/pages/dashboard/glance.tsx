import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import { type FC, type ReactNode, useState } from "react";
import { ReactECharts } from "~/components/charts/React-Echarts";
import { ReactEChartsLarge } from "~/components/charts/React-EchartsLarge";
import { LoadingSpinner } from "~/components/loading";

// import GaugeOption from "~/components/charts/GaugeChartDataTest";
// import PieChartOption from "~/components/charts/PieChartDataTest";
import BarChartOption from "~/components/charts/BarChartDataTest";
// import CalendarHeatMapOption from "~/components/charts/CalendarHeatMapDataTest";
import {
    ProjectPerformanceRatingCustomer,
    ProjectPerformanceRatingQuality,
    ProjectPerformanceRatingSafety,
    ProjectPerformanceRatingStaffing,
} from "~/components/charts/PerformanceDataPieChart";
import SunBurstTestOption from "~/components/charts/SunburstDataTest";
import { DashboardMenu } from "~/components/dashboardMenu";


const Loader = () => {
    return (
        <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-4 bg-zinc-700/20 sm:w-[80vw]">
            <LoadingSpinner />
        </div>
    );
};

type PieChartCardProps = {
    title: string;
    chart: ReactNode;
};

const PieChartCard: FC<PieChartCardProps> = ({ title, chart }) => {
    const [open, setOpen] = useState(true);

    const toggleOpen = () => {
        setOpen(!open);
    };

    return (
        <>
            <div
                className={`${open ? "h-72" : "h-14"
                    } overflow-hidden rounded bg-zinc-700 transition-all duration-200 m-auto w-[90vw] md:m-0 md:w-1/4`}
            >
                <div className="flex items-start justify-between p-2">
                    <h3 className="text-zinc-400">{title}</h3>
                    <button
                        onClick={() => toggleOpen()}
                        className="rounded bg-zinc-600 p-2 shadow transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                    >
                        <ArrowsUpDownIcon className="h-6 w-6 text-zinc-300" />
                    </button>
                </div>
                {open && <div>{chart}</div>}
            </div>
        </>
    );
};


const GlancePage: NextPage = () => {
    const loading = false;

    return (
        <main className="min-h-[100vh] bg-zinc-900 flex" >
            <DashboardMenu />
            <div className="w-full" >
                {loading ? (
                    <Loader />
                ) : (
                    <div className="w-full p-2">
                        <div className="h-80 rounded bg-zinc-200 shadow-lg md:w-3/6">
                            <h3 className="py-2 text-center text-lg font-semibold text-zinc-900">
                                All Jobs
                            </h3>
                            <ReactECharts option={BarChartOption} width="w-full" />
                        </div>
                        <div className="flex w-full flex-col justify-start gap-1 md:flex-row">
                            <div className="mx-auto flex items-center justify-center rounded py-5 font-bold text-zinc-100 md:m-0 md:bg-zinc-700 md:py-0 md:text-sm">
                                <p className="whitespace-nowrap md:-rotate-90">Overall Ratings</p>
                            </div>
                            <div className="flex h-full w-full flex-wrap items-start justify-start gap-1">
                                <PieChartCard
                                    title="Safety"
                                    chart={
                                        <ReactECharts
                                            option={ProjectPerformanceRatingSafety}
                                            width="full"
                                        />
                                    }
                                />
                                <PieChartCard
                                    title="Customer"
                                    chart={
                                        <ReactECharts
                                            option={ProjectPerformanceRatingCustomer}
                                            width="full"
                                        />
                                    }
                                />
                                <PieChartCard
                                    title="Performance"
                                    chart={
                                        <ReactECharts
                                            option={ProjectPerformanceRatingQuality}
                                            width="full"
                                        />
                                    }
                                />
                                <PieChartCard
                                    title="Staffing"
                                    chart={
                                        <ReactECharts
                                            option={ProjectPerformanceRatingStaffing}
                                            width="full"
                                        />
                                    }
                                />
                            </div>
                        </div>
                        <div className="m-5 h-full rounded">
                            <ReactEChartsLarge option={SunBurstTestOption} />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}


export default GlancePage;