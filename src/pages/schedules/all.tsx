import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { ScheduleItem } from "~/components/ScheduleItem";
import { api } from "~/utils/api";
import { useState } from "react";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useUser } from "@clerk/nextjs";

const AllPage: NextPage = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");

  const { isLoaded, isSignedIn } = useUser();

  const [animationParent] = useAutoAnimate();

  const { data, isLoading, isError } = api.schedules.getByName.useQuery({
    name: searchTerm,
  });

  const back = () => {
    if (window.history.length > 0) {
      router.back();
      return;
    }

    void router.push("/dashboard/blueprints");
  };

  if (!isLoaded) {
    return (
      <div>
        <LoadingPage2 />
      </div>
    );
  }

  if (!isSignedIn) {
    void router.push("/sign-in");
    return <div />;
  }

  return (
    <main className="min-h-[100vh] w-full bg-zinc-900">
      <div className=" fixed top-0 flex h-14 w-full items-center justify-between bg-zinc-900/50 p-2 backdrop-blur">
        <div className="flex w-full gap-2 md:w-1/2">
          <button
            onClick={back}
            className="rounded bg-zinc-800 p-2 transition-all duration-100 hover:bg-zinc-700"
          >
            <ArrowLeftIcon className="h-6 w-6 text-zinc-200" />
          </button>
          <input
            className="w-full rounded bg-zinc-800 p-2 outline-none ring-2 ring-zinc-700 transition duration-100 hover:ring focus:ring-amber-700"
            type="text"
            placeholder="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>
      <div className="h-14" />
      <div
        ref={animationParent}
        className="flex w-full flex-col items-center gap-2 p-2"
      >
        {!isLoading && !isError && data?.length == 0 && (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="select-none text-2xl font-semibold text-zinc-200">
                No schedules found.
              </p>
              <p className="select-none">
                Create a schedule in a blueprint for it to appear here.
              </p>
              <button
                onClick={back}
                className="flex items-center justify-center gap-2 rounded bg-zinc-700 p-2 font-semibold transition duration-100 hover:scale-105 hover:bg-zinc-600"
              >
                <ArrowLeftIcon className="h-6 w-6 text-zinc-200" />
                <p className="select-none">Back To Blueprints</p>
              </button>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="flex h-[50vh] w-full select-none items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <LoadingSpinner />
            </div>
          </div>
        )}
        {isError && !isLoading && (
          <div className="flex h-[50vh] w-full select-none items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-2xl font-semibold text-red-500">
                Snap! There was an error.
              </p>
              <p>{" Be sure you're connected to the internet."}</p>
            </div>
          </div>
        )}
        {data?.map((d) => (
          <ScheduleItem data={d} key={d.id} />
        ))}
      </div>
    </main>
  );
};

export default AllPage;
