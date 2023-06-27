import { type NextPage } from "next";
import { useState } from "react";
import { ScheduleItem } from "~/components/ScheduleItem";
import { DashboardMenu } from "~/components/dashboardMenu";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";


const SchedulesContainer = () => {

    const [searchTerm, setSearchTerm] = useState("")
    const { data: links, isLoading, isError } = api.schedules.getByName.useQuery({ name: searchTerm })

    return (
        <div className="border border-zinc-700 rounded w-full md:w-[50vw] p-3 h-[50vh] flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Recent Schedules</h1>
            <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="search schedules"
                className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
            />
            <div className="border-t border-zinc-700">
                {
                    isLoading ?
                        <div className="w-full h-full flex justify-center items-center p-4">
                            <LoadingSpinner />
                        </div>
                        :
                        isError ?
                            <p>Error Loading Schedules</p>
                            :
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    {
                                        links?.length === 0 ?
                                            <div className="w-full h-full flex justify-center items-center p-4">
                                                <p className="text-lg italic text-zinc-400">No Schedules Found</p>
                                            </div>
                                            :
                                            links?.map((link) => {
                                                return (
                                                    <ScheduleItem
                                                        key={link.id}
                                                        data={link}
                                                    />
                                                )
                                            }
                                            )
                                    }
                                </div>
                            </div>
                }
            </div>
        </div>
    )

}


const RecentActivityPage: NextPage = () => {


    return (
        <main className="flex min-h-[100vh] bg-zinc-900" >
            <DashboardMenu />
            <div className="w-full p-2 flex gap-1 flex-wrap justify-start items-start">
                <SchedulesContainer />
            </div>
        </main>
    )

}

export default RecentActivityPage