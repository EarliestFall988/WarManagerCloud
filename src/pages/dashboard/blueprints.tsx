import {
  ArrowLongUpIcon,
  CalendarDaysIcon,
  PlusIcon,
  SignalSlashIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import TooltipComponent from "~/components/Tooltip";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import { DashboardMenu } from "~/components/dashboardMenu";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import Head from "next/head";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import { DialogComponent } from "~/components/dialog";
// import { toast } from "react-hot-toast";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter } from "next/router";
import { BlueprintListItem } from "~/components/dashboardCards";
import { CouldNotLoadMessageComponent } from "~/components/couldNotLoadMessageComponent";

dayjs.extend(relativeTime);

const BlueprintsListPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  const [animationParent] = useAutoAnimate();

  const router = useRouter();

  const [blueprintSearchTerm, setBlueprintSearchTerm] = useState("");

  const {
    data,
    isLoading: loadingBlueprints,
    isError: loadingBlueprintsError,
  } = api.blueprints.search.useQuery({
    search: blueprintSearchTerm,
  });

  // const data = props.data;

  // if (loadingBlueprints)
  //   return (
  //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
  //       <LoadingSpinner />
  //     </div>
  //   );

  // if (loadingBlueprintsError || !data)
  //   return (
  //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
  //       <p className="text-lg italic text-red-500">Could not load blueprints</p>
  //     </div>
  //   );

  const getPinnedBlueprints = () => {
    return data?.filter((blueprint) => blueprint.pinned) || [];
  };

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/blueprints" />;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>Blueprints | War Manager</title>
      </Head>
      <div className="flex min-h-[100vh] w-full bg-zinc-900">
        <DashboardMenu />
        <div className="w-full">
          <div className=" flex w-full items-center justify-between gap-1 p-2">
            <div className="flex w-full gap-1">
              <input
                type="search"
                value={blueprintSearchTerm}
                onChange={(e) => setBlueprintSearchTerm(e.target.value)}
                placeholder="search blueprints"
                className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
              />
            </div>
            <TooltipComponent content="Create a New Blueprint" side="bottom">
              <Link
                href="/blueprints/new"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-zinc-700 bg-gradient-to-br text-center transition-all duration-100 hover:bg-amber-700 sm:text-lg sm:font-semibold"
              >
                <PlusIcon className="h-6 w-6" />
              </Link>
            </TooltipComponent>
            <TooltipComponent content="View Schedules" side="bottom">
              <Link
                href="/schedules/all"
                className="rounded bg-zinc-700 p-2 outline-none transition duration-100 hover:cursor-pointer hover:bg-amber-700 focus:bg-amber-700"
              >
                <CalendarDaysIcon className="h-6 w-6 text-zinc-200" />
              </Link>
            </TooltipComponent>
          </div>
          <div ref={animationParent} className="h-full w-full">
            {loadingBlueprints ? (
              <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-2">
                <LoadingSpinner />
                <p className="font-semibold text-zinc-600">
                  Loading Blueprints
                </p>
              </div>
            ) : loadingBlueprintsError || !data ? (
              <CouldNotLoadMessageComponent pluralName="blueprints" />
            ) : (
              data.length > 0 && (
                <>
                  <div className="flex w-full select-none flex-col gap-1 border-t border-zinc-700 text-gray-100 transition-all duration-100">
                    {!blueprintSearchTerm &&
                      getPinnedBlueprints().length > 0 && (
                        <div className="flex flex-col gap-1 p-2">
                          <div className="flex w-full items-center justify-between gap-1">
                            <p className="text-lg font-bold text-zinc-300">
                              Pinned Blueprints
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-zinc-300">
                                {getPinnedBlueprints().length} Pinned
                              </p>
                            </div>
                          </div>

                          {getPinnedBlueprints().length > 0 && (
                            <div className="flex flex-col gap-1">
                              {getPinnedBlueprints().map((blueprint) => (
                                <BlueprintListItem
                                  key={blueprint.id}
                                  pinned={blueprint.pinned || false}
                                  id={blueprint.id}
                                  name={blueprint.name}
                                  updatedAt={blueprint.updatedAt}
                                  description={blueprint.description}
                                  userEmail={blueprint.user?.email}
                                  liveData={blueprint.live || false}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    <div className="flex flex-col gap-1 p-2">
                      {data?.map((blueprint) => (
                        <BlueprintListItem
                          key={blueprint.id}
                          pinned={blueprint.pinned || false}
                          id={blueprint.id}
                          name={blueprint.name}
                          updatedAt={blueprint.updatedAt}
                          description={blueprint.description}
                          userEmail={blueprint.user?.email}
                          liveData={blueprint.live || false}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="h-20"></div>
                  <button
                    onClick={scrollToTop}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <p>Back To Top</p>
                    <ArrowLongUpIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
                  </button>
                  <div className="h-20" />
                </>
              )
            )}
            {data?.length === 0 && blueprintSearchTerm.length > 0 && (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-xl font-bold text-zinc-300">
                  No Blueprints matching your search{" "}
                  {`'${blueprintSearchTerm}'`}
                </p>
              </div>
            )}
            {data?.length === 0 &&
              blueprintSearchTerm.length === 0 &&
              navigator.onLine && (
                <div className="flex min-h-[90vh] select-none flex-col items-center justify-center gap-2 tracking-tight">
                  <div className="flex w-5/6 flex-col items-center justify-center gap-2 rounded p-2">
                    <p className="font-semibold text-zinc-300">
                      No Blueprints Exist
                    </p>
                    <button
                      onClick={() => {
                        void router.push("/blueprints/new");
                      }}
                      className="flex items-center justify-center gap-2 rounded bg-amber-800 p-2 transition duration-100 hover:bg-amber-700"
                    >
                      <PlusIcon className="h-6 w-6" />
                      <p>Create New Blueprint</p>
                    </button>
                  </div>
                </div>
              )}
            {data?.length === 0 && !navigator.onLine && (
              <div className="flex min-h-[90vh] flex-col items-center justify-center gap-2">
                <p className="font-semibold text-zinc-300">
                  {" It looks like you're Offline :("}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlueprintsListPage;
