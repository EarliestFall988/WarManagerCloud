import { ArrowLeftIcon, Square2StackIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useState } from "react";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import TooltipComponent from "~/components/Tooltip";

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
      <div className=" fixed top-0 z-10 flex h-14 w-full items-center justify-between bg-zinc-900/50 p-2 backdrop-blur">
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
        className="flex w-full flex-col items-center gap-2 p-2 "
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

type linkWithUser =
  | {
      user: null;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      title: string;
      description: string;
      link: string;
      authorId: string;
    }
  | {
      user: {
        id: string;
        email: string | undefined;
        profilePicture: string;
      };
      id: string;
      createdAt: Date;
      updatedAt: Date;
      title: string;
      description: string;
      link: string;
      authorId: string;
    };

const Copy = (url: string) => {
  void window.navigator.clipboard.writeText(url);
  toast.success("Link copied to clipboard");
};

export const ScheduleItem: React.FC<{ data: linkWithUser }> = ({ data }) => {
  return (
    <div className="3xl:w-1/2 w-full border-b border-zinc-700 hover:border-transparent xl:w-3/4">
      <Link
        href={data.link}
        target="_blank"
        passHref
        key={data.id}
        className="flex w-full items-center justify-between rounded transition-all duration-200 hover:bg-zinc-800 sm:py-2"
      >
        <div className="flex w-8/12 items-center">
          {data && data.user && data.user.profilePicture && (
            <Image
              className="scale-75 rounded-full sm:scale-90"
              src={data.user.profilePicture}
              width={50}
              height={50}
              alt={`${data.user.email || "unknown"} + 's profile picture`}
            />
          )}
          <div className="flex w-5/6 flex-col items-start justify-center pl-1 sm:w-2/3 ">
            {data.user?.profilePicture === null && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-400">
                <p className="font-semibold text-white">
                  {data.user?.email?.charAt(0).toUpperCase()}
                </p>
              </div>
            )}
            <p className="w-full truncate text-left text-lg font-semibold tracking-tight">
              {data.title}
            </p>
            <p className="text-sm text-zinc-400">
              {data.user?.email || "unknown"}
            </p>
          </div>
        </div>
        <p className="hidden italic text-zinc-300 md:flex md:w-1/2">
          {data.description}
        </p>
        <TooltipComponent content="Copy link to clipboard" side="bottom">
          <button
            onClick={(e) => {
              e.preventDefault();
              Copy(data.link);
            }}
            className="rounded p-2 hover:bg-amber-500 "
          >
            <Square2StackIcon className="h-6 w-6 text-zinc-200" />
          </button>
        </TooltipComponent>
      </Link>
    </div>
  );
};
