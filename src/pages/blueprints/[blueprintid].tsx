import type { NextPage } from "next";
import React, { useMemo } from "react";
import { type flowState } from "./flow";
import Head from "next/head";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CloudArrowUpIcon,
  EllipsisHorizontalIcon,
  IdentificationIcon,
  PaperAirplaneIcon,
  PresentationChartBarIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

// import * as Tooltip from "@radix-ui/react-tooltip";

import {
  useBlueprintStore,
  useStore as flowStore,
  DeleteSelected,
  type IFlowInstance,
} from "../../states/state";
import { LoadingPage, LoadingPage2, LoadingSpinner } from "~/components/loading";
import {
  CrewList,
  ExportBlueprint,
  More,
  ProjectsList,
  Stats,
} from "~/components/auxilaryBlueprintEditingComponents";
import { useCallback, useState } from "react";
import { api } from "~/utils/api";

import { shallow } from "zustand/shallow";
import { toast } from "react-hot-toast";
import FlowWithProvider from "./flow";
import type { Blueprint } from "@prisma/client";
import TooltipComponent from "~/components/Tooltip";

const selector = (state: flowState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

// const PreventUserFromLeaving = () => {
//   useEffect(() => {
//     window.addEventListener('beforeunload', alertUser)
//     window.addEventListener('unload', handleEndConcert)
//     return () => {
//       window.removeEventListener('beforeunload', alertUser)
//       window.removeEventListener('unload', handleEndConcert)
//       handleEndConcert()
//     }
//   }, [])
//   const alertUser = e => {
//     e.preventDefault()
//     e.returnValue = ''
//   }

//   return (
//     <div>
//       <div
//         when={isPrompt()}
//         message={() => 'Are you sure you want to leave this page?'}
//       />
//     </div>
//   )
// }
// const Component = () => {
//   useEffect(() => {
//     window.addEventListener('beforeunload', alertUser)
//     window.addEventListener('unload', handleEndConcert)
//     return () => {
//       window.removeEventListener('beforeunload', alertUser)
//       window.removeEventListener('unload', handleEndConcert)
//       // handleEndConcert()
//     }
//   }, [])
//   const alertUser = e => {
//     e.preventDefault()
//     e.returnValue = ''
//   }
//   const handleEndConcert = async () => {
//   //   await fetch({
//   //     url: endConcert(concert.id),
//   //     method: 'PUT'
//   //   })
//   }

const BlueprintGUI = () => {

  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { nodes, edges } = flowStore(selector, shallow);

  const [toggle, setToggle] = useState("");

  const { query } = useRouter();

  const blueprintId = (query.blueprintid as string) || undefined || null;

  const { mutate, isLoading: isSaving } = api.blueprints.save.useMutation({
    onSuccess: (data) => {
      // console.log("saved data");
      // console.log(data);

      toast.success(`${data.name} saved successfully`);

      const flow = JSON.parse(data.data) as IFlowInstance;

      flowStore.getState().nodes = flow.nodes;
      flowStore.getState().edges = flow.edges;

      useBlueprintStore.getState().blueprintInstance = data;
    },

    onError: (error) => {
      console.log("error saving blueprint");
      console.log(error);

      toast.error("Error saving blueprint");
    },
  });

  const onSave = useCallback(() => {
    const blueprintId = useBlueprintStore.getState().blueprintId;

    // if(blueprintId == null) return;

    const flowInstance = JSON.stringify({
      nodes: nodes,
      edges: edges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    });

    mutate({ blueprintId, flowInstanceData: flowInstance });
  }, [mutate, edges, nodes]);

  const ToggleMenu = useCallback(
    (menu: string) => {
      let next = menu;

      if (menu === toggle) {
        next = "";
      }

      setToggle(next);
    },
    [toggle, setToggle]
  );

  const bpId = blueprintId || "";

  const { data: blueprintData, isLoading: loadingBlueprints } =
    api.blueprints.getOneById.useQuery({
      blueprintId: bpId,
    });

  useMemo(() => {
    if (blueprintId && !loadingBlueprints) {
      const blueprint = blueprintData as Blueprint;

      if (blueprint) {
        // console.log("blueprint", blueprint);

        useBlueprintStore.setState({ blueprintId: blueprintId });
        useBlueprintStore.getState().blueprintInstance = blueprint;

        if (blueprint.data && blueprint.data !== "{}") {
          const flowInstance = JSON.parse(blueprint.data) as IFlowInstance;

          // console.log("flowInstance", flowInstance);

          if (flowInstance) {
            flowStore.getState().nodes = flowInstance.nodes;
            flowStore.getState().edges = flowInstance.edges;

            // console.log("finished loading blueprint");

            // console.log("nodes", flowStore.getState().nodes);
          }
        }

        useBlueprintStore.getState().isLoading = false;
      } else {
        flowStore.getState().nodes = [];
        flowStore.getState().edges = [];
      }
    } else {
      // useBlueprintStore.getState().blueprintId = "";
      // useBlueprintStore.getState().blueprintInstance = {
      //   id: "",
      //   name: "",
      //   description: "",
      //   data: "",
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      //   authorId: "",
      // };
      useBlueprintStore.getState().isLoading = true;
    }
  }, [blueprintId, loadingBlueprints, blueprintData]);

  const blueprint = useBlueprintStore.getState().blueprintInstance;


  if (!isLoaded || !blueprintId) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl={`/blueprints/${blueprintId}`} />;
  }

  return (
    <>
      <Head>
        {blueprint.name && (
          <title>{`${blueprint.name} (Blueprint) - War Manager`}</title>
        )}
        {(!blueprint || !blueprint.name) && (
          <title>Grabbing Blueprint - War Manager</title>
        )}

        {/* <meta name="description" content="" /> */}

        {blueprint.name && (
          <meta name="description">{`${blueprint.description}`}</meta>
        )}
        {(!blueprint || !blueprint.description) && (
          <meta name="description"></meta>
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="absolute inset-0 top-0 z-20 flex h-12 w-full items-center justify-between bg-zinc-700 p-1 text-gray-100 drop-shadow-md ">
          <div className="flex w-1/2 items-center justify-start gap-4 sm:w-1/3">
            <TooltipComponent content="Back" side="bottom">
              <button
                className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                onClick={() => {
                  router.back();
                }}
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
            </TooltipComponent>
            <div className="max-w-1/2 truncate rounded p-1 text-center text-sm font-semibold tracking-tight text-zinc-200 md:text-lg">
              <TooltipComponent content="Blueprint Name" side="bottom">
                <div className="py-1">
                  {blueprint.name ? blueprint.name : <LoadingSpinner />}
                </div>
              </TooltipComponent>
            </div>
          </div>

          <div className="flex w-1/2 items-center justify-end gap-1 sm:w-1/3 sm:gap-2">
            {blueprint.id && (
              <>
                <TooltipComponent content="Save to Cloud" side="bottom">
                  <button
                    disabled={isSaving}
                    className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                    onClick={() => onSave()}
                  >
                    {!isSaving && <CloudArrowUpIcon className="h-6 w-6" />}
                    {isSaving && (
                      <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
                        <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
                      </div>
                    )}
                  </button>
                </TooltipComponent>
              </>
            )}
            <TooltipComponent content="Account" side="bottom">
              <div className="flex items-center gap-2 rounded bg-zinc-600 p-1 hover:scale-105 hover:bg-zinc-500">
                <UserButton />
              </div>
            </TooltipComponent>
          </div>
        </div>
        <div className="min-h-[100vh] min-w-[100vw] bg-zinc-800">
          {useBlueprintStore.getState().isLoading ? (
            <LoadingPage />
          ) : (
            <>
              <FlowWithProvider blueprintId={blueprintId} />
              <div
                className={`absolute right-0 top-16 z-20 flex justify-end rounded bg-zinc-700/80 drop-shadow-lg backdrop-blur-md transition-all duration-75 sm:gap-1 sm:p-1 ${toggle == "" ? "w-12" : " w-full md:w-[50vw] lg:w-[40vw]"
                  }`}
              >
                <div className="w-full overflow-y-auto overflow-x-hidden ">
                  {toggle === "GetLink" && <ExportBlueprint />}
                  {toggle === "Project" && <ProjectsList nodes={nodes} />}
                  {toggle === "Employee" && <CrewList nodes={nodes} />}
                  {toggle === "Stats" && (
                    <Stats blueprint={blueprint} currentNodes={nodes} />
                  )}
                  {toggle == "More" && <More blueprint={blueprint} />}
                </div>
                <div className="flex flex-col items-end gap-1 p-1 sm:gap-1 sm:p-0">
                  {/* {toggle !== "" && (
                    <button
                      onClick={() => ToggleMenu("")}
                      className="btn-add z-20 rounded bg-red-700 p-2 py-4 text-white hover:scale-105 hover:bg-red-600 sm:py-2"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )} */}
                  <TooltipComponent content="Projects" side="left">
                    <button
                      onClick={() => ToggleMenu("Project")}
                      className={`btn-add  z-20 rounded ${toggle == "Project"
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                        }  p-2 py-4 hover:scale-105  sm:py-2`}
                    >
                      <WrenchScrewdriverIcon className="h-6 w-6" />
                    </button>
                  </TooltipComponent>
                  <TooltipComponent content="Crew Members" side="left">
                    <button
                      onClick={() => ToggleMenu("Employee")}
                      className={`btn-add  z-20 rounded ${toggle == "Employee"
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                        }  p-2 py-4 hover:scale-105  sm:py-2`}
                    >
                      <IdentificationIcon className="h-6 w-6" />
                    </button>
                  </TooltipComponent>
                  <div className="w-full border-b border-zinc-600" />
                  <TooltipComponent content="Share" side="left">
                    <button
                      onClick={() => ToggleMenu("GetLink")}
                      className={`btn-add  z-20 rounded ${toggle == "GetLink"
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                        }  p-2 py-4 hover:scale-105  sm:py-2`}
                    >
                      <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                  </TooltipComponent>
                  <TooltipComponent content="Blueprint Stats" side="left">
                    <button
                      onClick={() => ToggleMenu("Stats")}
                      className={`btn-add  z-20 rounded ${toggle == "Stats"
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                        }  p-2 py-4 hover:scale-105  sm:py-2`}
                    >
                      <PresentationChartBarIcon className="h-6 w-6" />
                    </button>
                  </TooltipComponent>
                  <div className="w-full border-b border-zinc-600" />
                  <TooltipComponent content="More" side="left">
                    <button
                      onClick={() => ToggleMenu("More")}
                      className={`btn-add  z-20 rounded ${toggle == "More"
                        ? "bg-amber-800 hover:bg-amber-700"
                        : "bg-zinc-600 hover:bg-zinc-500"
                        }  p-2 py-4 hover:scale-105  sm:py-2`}
                    >
                      <EllipsisHorizontalIcon className="h-6 w-6" />
                    </button>
                  </TooltipComponent>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="fixed left-0 top-16 flex flex-col justify-center gap-1 rounded bg-zinc-700 p-1 transition-all duration-100 ">
          <TooltipComponent content="Remove" side="right">
            <button
              className="rounded bg-zinc-600 bg-gradient-to-br p-2 py-4 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500 sm:py-2"
              onClick={DeleteSelected}
            >
              <TrashIcon className="h-6 w-6" />
            </button>
          </TooltipComponent>
          <div className="w-full border-b border-zinc-600" />
          <TooltipComponent content="Undo" side="right">
            <button
              className="rounded bg-zinc-600 bg-gradient-to-br p-2 py-4 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500 sm:py-2"
              onClick={() => ToggleMenu("more")}
            >
              <ArrowUturnLeftIcon className="h-6 w-6" />
            </button>
          </TooltipComponent>
          <TooltipComponent content="Redo" side="right">
            <button
              className="rounded bg-zinc-600 bg-gradient-to-br p-2 py-4 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500 sm:py-2"
              onClick={() => ToggleMenu("more")}
            >
              <ArrowUturnRightIcon className="h-6 w-6" />
            </button>
          </TooltipComponent>
        </div>
      </main>
    </>
  );
};

const BlueprintPage: NextPage = () => {
  return (
    <>
      <SignedIn>
        <BlueprintGUI />
      </SignedIn>
      <SignedOut>
        <Head>
          <title>You are not signed in - War Manager</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SignInModal redirectUrl={`/dashboard`} />
      </SignedOut>
    </>
  );
};

export default BlueprintPage;
