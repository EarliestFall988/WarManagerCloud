import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import { useState, useMemo } from "react";
import {
  PhoneIcon,
  Square2StackIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import { ErrorIcon, toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";

type crewType = {
  id: string;
  name: string;
  position: string;
  phone: string;
} | null;

type jobType = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  crew: crewType[];
};

const SchedulePage: NextPage = () => {
  const { query } = useRouter();

  const id = query.slug as string;

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading: loading,
    isError: error,
  } = api.timeScheduling.getTimeScheduleById.useQuery({
    id: id,
    searchTerm,
  });

  const [animationParent] = useAutoAnimate();

  const [jobs, setJobs] = useState<jobType[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  useMemo(() => {
    if (data === undefined || data === null) return;
    if (
      data.ScheduleHistoryItems === undefined ||
      data.ScheduleHistoryItems === null
    )
      return;

    if (startDate === undefined)
      setStartDate(data.defaultStartDate?.toLocaleDateString());
    if (endDate === undefined)
      setEndDate(data.defaultEndDate?.toLocaleDateString());

    const newJobs: jobType[] = [];

    data.ScheduleHistoryItems.forEach((item) => {
      if (item.project === null || item.project === undefined) return;
      if (item.project.name === null || item.project.name === undefined) return;
      if (item.project.address === null || item.project.address === undefined)
        return;

      console.log(item.crew, item.project);

      const constFoundJob = newJobs.find(
        (job) => job.name === item.project.name
      );
      if (constFoundJob !== undefined) {
        constFoundJob.crew.push(item.crew);
      } else {
        newJobs.push({
          id: item.project.id,
          name: item.project.name,
          address: item.project.address,
          city: item.project.city,
          state: item.project.state,
          crew: [item.crew],
        });
      }
    });
    setJobs(newJobs);
  }, [data, startDate, endDate]);

  return (
    <>
      <div className="min-h-[100vh] w-full bg-zinc-900">
        <div className="fixed top-0 z-20 w-full border-b border-zinc-500 bg-black/60 p-2 backdrop-blur">
          <div className="p-2">
            <p className="text-4xl font-semibold">Schedule</p>
            <p className="font-semibold">
              {startDate} to {endDate}
            </p>
          </div>
          <input
            className="w-full rounded bg-zinc-700 p-2 text-zinc-100 outline-none ring-2 ring-zinc-600 transition duration-100 hover:ring focus:ring-2 focus:ring-amber-600"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div ref={animationParent}>
          {error ? (
            <div className="flex min-h-[100vh] select-none flex-col items-center justify-center">
              <div className="flex items-center gap-2 p-2 text-lg font-semibold">
                Error Loading Schedule, Try Again Later.
                <ErrorIcon className="h-8 w-8" />
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex min-h-[100vh] select-none flex-col items-center justify-center">
                  <LoadingSpinner />
                  {searchTerm.length === 0 && (
                    <p className="p-2 text-lg font-semibold">
                      Loading Schedule
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="select-none py-52">
                    {jobs.map((job) => (
                      <Job job={job} key={job.id} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Job: React.FC<{ job: jobType }> = ({ job }) => {
  const copyAddress = (address: string) => {
    void navigator.clipboard.writeText(address);
    toast.success("Copied Address");
  };

  return (
    <>
      <div id={job.id} className="border-b border-zinc-800 p-2" key={job.id}>
        <div className="flex items-center gap-2 py-2">
          <WrenchScrewdriverIcon className="h-8 w-8" />
          <div>
            <p className="text-2xl font-semibold">{job.name}</p>
            <p className="tracking-tight">
              {job.address}
              {","} {job.city}
              {", "}
              {job.state}
            </p>
            <button
              onClick={() => {
                copyAddress(job.address + ", " + job.city + ", " + job.state);
              }}
              className="flex items-center rounded bg-amber-700 p-2 transition duration-100 hover:bg-amber-600"
            >
              <Square2StackIcon className="h-6 w-6" />
              Copy Address
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {job.crew
            .filter((c) => c !== null)
            .map((c) => (
              <div
                className="flex items-center justify-between rounded border-zinc-700 bg-zinc-800 p-2"
                key={c?.id}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-6 w-6" />
                    <p className="text-lg font-semibold"> {c?.name}</p>{" "}
                    <p className="text-sm">{c?.position}</p>
                  </div>
                  <p className="text-sm">{c?.phone}</p>
                </div>
                {c?.phone !== null && c?.phone !== undefined && (
                  <Link
                    href={`tel:${c?.phone}`}
                    className="flex cursor-pointer gap-2 rounded bg-zinc-700 p-2 transition duration-100 hover:bg-zinc-600"
                  >
                    <PhoneIcon className="h-6 w-6" />
                    Call
                  </Link>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

// export const getStaticProps: GetStaticProps = async (
//   context: GetStaticPropsContext
// ) => {
//   const helper = generateSSGHelper();

//   const id = context.params?.slug;

//   if (typeof id !== "string") throw new Error("slug is not a string");
//   if (id.length <= 0) throw new Error("slug too short");

//   await helper.timeScheduling.getTimeScheduleById.prefetch({ id: id });

//   const result = helper.dehydrate();

//   return {
//     props: {
//       trpcState: result,
//       id: id,
//     },
//     revalidate: 1,
//   };
// };

// export const getStaticPaths = () => {
//   return {
//     paths: [],
//     fallback: "blocking",
//   };
// };

export default SchedulePage;
