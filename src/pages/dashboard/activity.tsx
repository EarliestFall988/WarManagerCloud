import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { ScheduleItem } from "~/components/ScheduleItem";
import { DashboardMenu } from "~/components/dashboardMenu";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const SchedulesContainer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: links,
    isLoading,
    isError,
  } = api.schedules.getByName.useQuery({ name: searchTerm });

  return (
    <>
      <Head>
        <title>Recent Activity | War Manager</title>
      </Head>
      <div className="flex h-[50vh] w-full flex-col gap-1 rounded border border-zinc-700 p-3 md:w-[50vw]">
        <h1 className="text-2xl font-semibold">Recent Schedules</h1>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="search schedules"
          className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
        />
        <div className="border-t border-zinc-700">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <p>Error Loading Schedules</p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                {links?.length === 0 ? (
                  <div className="flex h-full w-full items-center justify-center p-4">
                    <p className="text-lg italic text-zinc-400">
                      No Schedules Found
                    </p>
                  </div>
                ) : (
                  links?.map((link) => {
                    return <ScheduleItem key={link.id} data={link} />;
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const RecentActivityPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/activity" />;
  }

  return (
    <main className="flex min-h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="flex w-full flex-wrap items-start justify-start gap-1 p-2">
        <SchedulesContainer />
      </div>
    </main>
  );
};

export default RecentActivityPage;
