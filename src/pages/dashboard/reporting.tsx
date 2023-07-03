import type { NextPage } from "next";
import { DashboardMenu } from "~/components/dashboardMenu";




const ReportingPage: NextPage = () => {

    return (
        <>
            <main className="min-h-[100vh] w-full bg-zinc-900 flex items-start justify-start">
                <div>
                    <DashboardMenu />
                </div>
                <div className="p-2 w-full h-full flex flex-col gap-2 justify-start items-start">
                    <div className="flex flex-col items-start justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
                        <h2 className="text-3xl font-semibold">Reporting</h2>
                        <p className="text-md tracking-tight">This is the reporting page</p>
                    </div>
                    <div className="flex flex-col md:items-start gap-2 justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
                        <h2 className="text-xl font-semibold">Pipe Drive</h2>
                        <button className="p-2 rounded bg-amber-700 hover:bg-amber-600 focus:bg-amber-600 duration-100 transition-all hover:scale-105">{"Download Data (XLSX)"}</button>
                    </div>
                </div>
            </main>
        </>
    )
}

export default ReportingPage;