import { ArrowLongUpIcon, ArrowPathIcon, ClipboardDocumentIcon, EllipsisVerticalIcon, FlagIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { NextPage } from "next";
import Link from "next/link";
import { useCallback, useState } from "react";
import TooltipComponent from "~/components/Tooltip";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import { DashboardMenu } from "~/components/dashboardMenu";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import Head from "next/head";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DialogComponent } from "~/components/dialog";
import { toast } from "react-hot-toast";
import { useAutoAnimate } from "@formkit/auto-animate/react";

dayjs.extend(relativeTime);

const BlueprintsListPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  const [animationParent] = useAutoAnimate();

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
  }

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
                href="/newblueprint"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-zinc-700 bg-gradient-to-br text-center transition-all duration-100 hover:bg-amber-700 sm:text-lg sm:font-semibold"
              >
                <PlusIcon className="h-6 w-6" />
              </Link>
            </TooltipComponent>
          </div>
          <div ref={animationParent} className="w-full h-full" >
            {loadingBlueprints ? (
              <div className="h-[100vh] w-full flex flex-col gap-2 justify-center items-center">
                <LoadingSpinner />
                <p className="text-zinc-600 font-semibold">Loading Blueprints</p>
              </div>
            ) : loadingBlueprintsError || !data ? (
              <div className="flex w-full items-center justify-center">
                <p className="text-lg italic text-red-500">
                  Could not load blueprints
                </p>
              </div>
            ) : (
              data.length > 0 && (
                <>
                  <div className="flex w-full flex-col gap-1 border-t border-zinc-700 text-gray-100 select-none transition-all duration-100">
                    {!blueprintSearchTerm && getPinnedBlueprints().length > 0 && (
                      <div className="flex flex-col gap-1 p-2">
                        <div className="flex w-full items-center justify-between gap-1">
                          <p className="text-lg font-bold text-zinc-300">Pinned Blueprints</p>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-zinc-300">{getPinnedBlueprints().length} Pinned</p>
                            {/* {getPinnedBlueprints().length > 0 && (
                        <div className="flex gap-1">
                          <TooltipComponent content="Unpin All" side="bottom">
                            <button
                              onClick={() => {
                                // void api.blueprints.unpinAll.mutateAsync();
                                toast.success("Unpinned all blueprints");
                              }}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-zinc-700 bg-gradient-to-br text-center transition-all duration-100 hover:bg-amber-700 sm:text-lg sm:font-semibold"
                            >
                              <TrashIcon className="h-6 w-6" />
                            </button>
                          </TooltipComponent>
                        </div>
                      )} */}
                          </div>
                        </div>

                        {getPinnedBlueprints().length > 0 && (
                          <div className="flex flex-col gap-1">
                            {getPinnedBlueprints().map((blueprint) => (
                              <BlueprintListItem key={blueprint.id} pinned={blueprint.pinned || false} id={blueprint.id} name={blueprint.name} updatedAt={blueprint.updatedAt} description={blueprint.description} userEmail={blueprint.user?.email} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-2 gap-1 flex flex-col">
                      {data?.map((blueprint) => (
                        <BlueprintListItem key={blueprint.id} pinned={blueprint.pinned || false} id={blueprint.id} name={blueprint.name} updatedAt={blueprint.updatedAt} description={blueprint.description} userEmail={blueprint.user?.email} />
                      ))}
                    </div>
                  </div>
                  <div className="h-20"></div>
                  <button onClick={scrollToTop} className="w-full gap-2 flex items-center justify-center">
                    <p>Back To Top</p>
                    <ArrowLongUpIcon className="w-5 h-5 text-zinc-400 hover:text-zinc-200" />
                  </button>
                  <div className="h-20" />
                </>
              )
            )}
            {data?.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-xl font-bold text-zinc-300">
                  No Blueprints matching your search {`'${blueprintSearchTerm}'`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


const BlueprintListItem: React.FC<{ id: string, pinned: boolean, name: string, description: string, updatedAt: Date, userEmail: string | undefined }> = ({ id, name, pinned, description, updatedAt, userEmail }) => {

  const copy = (text: string, type: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const [isPinned, setIsPinned] = useState<"pinning" | "unpinning" | "unknown">("unknown");

  const blueprintContext = api.useContext().blueprints;

  const { mutate } = api.blueprints.setBlueprintPined.useMutation(
    {
      onSuccess: () => {
        toast.success(isPinned === "pinning" ? `${name} Pinned` : `${name} unpinned`)
        setIsPinned("unknown");
        void blueprintContext.invalidate();
      },

      onError: (error) => {
        console.log(error);
        toast.error('Something went wrong');
      }
    }
  );

  const toggleBlueprintPinned = useCallback((id: string, blueprintPinned: boolean) => {

    setIsPinned(blueprintPinned ? "pinning" : "unpinning");

    mutate({ blueprintId: id, isPinned: blueprintPinned });
  }, [mutate]);

  return (
    <div
      key={id}
      className="flex w-full items-center justify-between gap-1 rounded-sm bg-zinc-700  hover:bg-zinc-600 transition-all duration-100 select-none"
    >
      <Link
        href={`/blueprints/${id}`}
        passHref
        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded-sm p-2 "
      >
        <div className="w-3/2 tracking-tight md:w-3/5">
          <div className="flex gap-1 items-center justify-start">
            {pinned && (
              <div className="flex items-center justify-start gap-1">
                <TooltipComponent content="Pinned" side="bottom">
                  <FlagIcon className="h-3 w-3 text-amber-500" />
                </TooltipComponent>
              </div>
            )}
            <h2 className="truncate text-left text-lg font-semibold tracking-tight">
              {name}
            </h2>
          </div>
          {userEmail && (
            <div className="flex items-start justify-start gap-1 font-normal text-zinc-300">
              <p className="truncate text-sm">
                {userEmail}
              </p>
            </div>
          )}
        </div>
        <div className="hidden font-thin md:flex md:w-1/2 ">
          <p className="w-full truncate text-ellipsis text-center">
            {description}
          </p>
        </div>
        <p className="w-1/4 truncate text-right text-zinc-300 text-xs">
          {dayjs(updatedAt).fromNow()}
        </p>
      </Link>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex w-1/12 items-center justify-end rounded-sm bg-transparent p-1 transition-all duration-100 md:w-auto outline-none select-none">
            <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="TooltipContent w-44 rounded border border-zinc-500 bg-black/50 p-3 py-2 drop-shadow-lg backdrop-blur ">
            <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-500" />
            <DropdownMenu.Item
              className="outline-none selection-none flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
              onClick={(e) => {
                e.preventDefault();
                copy(`${window.location.origin}/blueprints/${id}`, "Blueprint Link ");
              }}
            >
              <ClipboardDocumentIcon className="h-5 w-5 text-zinc-200 " />
              Copy Link
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="outline-none flex selection-none items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
              onClick={(e) => {
                e.preventDefault();
                toggleBlueprintPinned(id, !pinned);
              }}
              disabled={isPinned === "pinning" || isPinned === "unpinning"}
            >
              {isPinned === "unknown" && (
                <>
                  <FlagIcon className="h-5 w-5 text-zinc-200" />
                  {pinned ? <p>Unpin</p> : <p>Pin</p>}
                </>
              )}
              {
                isPinned === "pinning" && (
                  <>
                    <ArrowPathIcon className="h-5 w-5 text-zinc-200 animate-spin" />
                    <p>Pinning...</p>
                  </>
                )
              }
              {
                isPinned === "unpinning" && (
                  <>
                    <ArrowPathIcon className="h-5 w-5 text-zinc-200 animate-spin" />
                    <p>Unpinning...</p>
                  </>
                )
              }
            </DropdownMenu.Item>
            <DialogComponent title={"Are you sure you want to delete this blueprint?"} description="If you click yes, it cannot be recovered." yes={() => { console.log("remove blueprint") }} trigger={
              <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                <TrashIcon className="h-4 w-4 text-white" />
                Delete
              </button>
            } />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

export default BlueprintsListPage;
