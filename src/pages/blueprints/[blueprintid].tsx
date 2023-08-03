import type { NextPage } from "next";
import Head from "next/head";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import { useRouter } from "next/router";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  IdentificationIcon,
  PresentationChartBarIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

import {
  LoadingPage,
  LoadingPage2,
  LoadingSpinner,
} from "~/components/loading";
import {
  CrewList,
  ExportBlueprint,
  More,
  ProjectsList,
  Stats,
} from "~/components/auxilaryBlueprintEditingComponents";
import React, { useCallback, useState } from "react";
import { api } from "~/utils/api";

import { toast } from "react-hot-toast";
import type { Blueprint } from "@prisma/client";
import TooltipComponent from "~/components/Tooltip";
ArrowUturnLeftIcon;
import dynamic from "next/dynamic";
import { Disconnect, Redo, Undo } from "~/flow/ydoc";
import { type Node } from "reactflow";
// import useNodesStateSynced, {
//   DeleteNode,
//   GetNodes,
//   nodesMap,
// } from "~/flow/useNodesStateSynced";
import { GetEdges } from "~/flow/useEdgesStateSynced";
import  {
  DeleteNode,
  GetNodes,
  nodesMap,
} from "~/flow/useNodesStateSynced";

const BlueprintGUI = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { query } = useRouter();

  const blueprintId = (query.blueprintid as string) || undefined || null;

  const { mutate, isLoading: isSaving } = api.blueprints.save.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} saved successfully`);
    },

    onError: (error) => {
      console.log("error saving blueprint", error);
      toast.error("Error saving blueprint");
    },
  });

  const onSave = useCallback(() => {
    if (!blueprintId) return;

    const nodes = GetNodes(blueprintId);
    const edges = GetEdges(blueprintId);

    const flowInstance = JSON.stringify({
      nodes,
      edges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    });

    mutate({ blueprintId, flowInstanceData: flowInstance });
  }, [mutate, blueprintId]);

  const { data: blueprint } = api.blueprints.getOneById.useQuery({
    blueprintId: blueprintId || "",
  });

  // React.useEffect(() => {
  //   if (!blueprintId) return;

  //   setInterval(() => {
  //   const nodes = blueprintNodes;
  //   setNodes(nodes);
  // }, 1000);
  // }, [blueprintId]);

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    if (blueprintId)
      return <SignInModal redirectUrl={`/blueprints/${blueprintId}`} />;
    else return <SignInModal redirectUrl="/dashboard/blueprints" />;
  }

  if (blueprintId == null) {
    return <LoadingPage />;
  }

  const BlueprintFlowProvider = dynamic(() => import("../../flow/flow"), {
    ssr: false,
  });

  const CostingComponent = dynamic(
    () => import("../../flow/costingComponent"),
    {
      ssr: false,
    }
  );

  return (
    <>
      <Head>
        {blueprint?.name && (
          <title>{`${blueprint.name} (Blueprint) - War Manager`}</title>
        )}
        {(!blueprint || !blueprint.name) && (
          <title>Grabbing Blueprint - War Manager</title>
        )}

        {/* <meta name="description" content="" /> */}

        {blueprint?.name && (
          <meta name="description">{`${blueprint.description}`}</meta>
        )}
        {(!blueprint || !blueprint.description) && (
          <meta name="description"></meta>
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="min-h-[100vh] min-w-[100vw] bg-zinc-800">
          <Ribbon
            name={blueprint?.name}
            description={blueprint?.description}
            isSaving={isSaving}
            OnSave={onSave}
          />
          {blueprint ? (
            <>
              {/* <FlowWithProvider blueprintId={blueprintId} /> */}
              <BlueprintFlowProvider
                blueprintId={blueprintId}
              />
              <Panels blueprint={blueprint} />
              <CostingComponent blueprintId={blueprint.id} />
            </>
          ) : (
            <LoadingPage />
          )}
        </div>
        <ToolbarComponent
          blueprintId={blueprintId}
        />
      </main>
    </>
  );
};

const Ribbon: React.FC<{
  name?: string;
  description?: string;
  isSaving: boolean;
  OnSave: () => void;
}> = ({ name, description, isSaving, OnSave }) => {
  const router = useRouter();

  return (
    <div className="absolute inset-0 top-0 z-20 flex h-12 w-full items-center justify-between bg-zinc-700 p-1 text-gray-100 drop-shadow-md ">
      <div className="flex w-1/2 items-center justify-start gap-4 sm:w-1/3">
        <TooltipComponent content="Back" side="bottom">
          <button
            className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
            onClick={() => {
              if (history.length > 0) router.back();
              else void router.push(`/dashboard/blueprints`);

              Disconnect();
            }}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        <div className="max-w-1/2 truncate rounded p-1 text-center text-sm font-semibold tracking-tight text-zinc-200 md:text-lg">
          <TooltipComponent
            content={description ? description : "Loading..."}
            side="bottom"
            disableToolTipIfNoContent={true}
          >
            <div className="py-1">{name ? name : <LoadingSpinner />}</div>
          </TooltipComponent>
        </div>
      </div>

      <div className="flex w-1/2 items-center justify-end gap-1 sm:w-1/3 sm:gap-2">
        {name && (
          <>
            <TooltipComponent
              content="Share blueprint with other managers (link)"
              side="bottom"
              disableToolTipIfNoContent={true}
            >
              <button
                disabled={isSaving}
                className="flex rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                onClick={() => {
                  void navigator.clipboard.writeText(`${window.location.href}`);
                  toast.success("Copied blueprint link to clipboard");
                }}
              >
                <ArrowTopRightOnSquareIcon className="h-6 w-6" />
              </button>
            </TooltipComponent>
            <TooltipComponent
              content="Save changes to the Cloud"
              side="bottom"
              disableToolTipIfNoContent={true}
            >
              <button
                disabled={isSaving}
                className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                onClick={OnSave}
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
        <TooltipComponent
          content="Account"
          side="bottom"
          disableToolTipIfNoContent={true}
        >
          <div className="flex items-center gap-2 rounded bg-zinc-600 p-1 hover:scale-105 hover:bg-zinc-500">
            <UserButton />
          </div>
        </TooltipComponent>
      </div>
    </div>
  );
};

const Panels: React.FC<{
  blueprint?: Blueprint | null | undefined;
}> = ({ blueprint }) => {
  const [toggle, setToggle] = useState("");

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

  if (!blueprint) {
    return <></>;
  }

  return (
    <div
      className={`absolute right-0 top-16 z-20 flex justify-end rounded bg-zinc-700/80 drop-shadow-lg backdrop-blur-md transition-all duration-75 sm:gap-1 sm:p-1 ${
        toggle == "" ? "w-12" : " w-full md:w-[50vw] lg:w-[40vw]"
      }`}
    >
      <div className="w-full overflow-y-auto overflow-x-hidden ">
        {toggle === "GetLink" && <ExportBlueprint blueprintId={blueprint.id} />}
        {toggle === "Project" && <ProjectsList blueprintId={blueprint.id} />}
        {toggle === "Employee" && <CrewList blueprintId={blueprint.id} />}
        {toggle === "Stats" && <Stats blueprint={blueprint} />}
        {toggle == "More" && <More blueprint={blueprint} />}
      </div>
      <div className="flex flex-col items-end gap-1 p-1 sm:gap-1 sm:p-0">
        <TooltipComponent content="Projects" side="left">
          <button
            onClick={() => ToggleMenu("Project")}
            className={`btn-add  z-20 rounded ${
              toggle == "Project"
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
            className={`btn-add  z-20 rounded ${
              toggle == "Employee"
                ? "bg-amber-800 hover:bg-amber-700"
                : "bg-zinc-600 hover:bg-zinc-500"
            }  p-2 py-4 hover:scale-105  sm:py-2`}
          >
            <IdentificationIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        <div className="w-full border-b border-zinc-600" />
        <TooltipComponent content="Schedules" side="left">
          <button
            onClick={() => ToggleMenu("GetLink")}
            className={`btn-add  z-20 rounded ${
              toggle == "GetLink"
                ? "bg-amber-800 hover:bg-amber-700"
                : "bg-zinc-600 hover:bg-zinc-500"
            }  p-2 py-4 hover:scale-105  sm:py-2`}
          >
            <DocumentTextIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        <TooltipComponent content="Blueprint Stats" side="left">
          <button
            onClick={() => ToggleMenu("Stats")}
            className={`btn-add  z-20 rounded ${
              toggle == "Stats"
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
            className={`btn-add  z-20 rounded ${
              toggle == "More"
                ? "bg-amber-800 hover:bg-amber-700"
                : "bg-zinc-600 hover:bg-zinc-500"
            }  p-2 py-4 hover:scale-105  sm:py-2`}
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
      </div>
    </div>
  );
};

const ToolbarComponent: React.FC<{
  blueprintId?: string;
}> = ({ blueprintId }) => {
  const GetSelectedNode = () => {
    if (!blueprintId) return;

    let selectedNode: Node | undefined = undefined;

    nodesMap(blueprintId).forEach((node) => {
      if (node.selected) {
        selectedNode = node;
      }
    });

    return selectedNode;
  };

  const GoToDetails = () => {
    if (!blueprintId) return;

    const node = GetSelectedNode() as Node | undefined;

    if (!node) return;

    if (node.selected) {
      if (node.type === "crewNode") {
        const data = node.data as { id: string };
        void window.open(`/crewmember/${data.id}`);
        return;
      }

      if (node.type === "projectNode") {
        const data = node.data as { id: string };
        void window.open(`/projects/${data.id}`);
        return;
      }
    }
  };

  const DeleteSelected = () => {
    if (!blueprintId) return;

    const node = GetSelectedNode() as Node | undefined;

    console.log(node);

    if (!node) return;

    if (node.selected) {
      const nodes = DeleteNode(blueprintId, node.id);
      // if (onFlowUpdate) onFlowUpdate(nodes);
    }
  };

  return (
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
          onClick={() => Undo()}
        >
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
      </TooltipComponent>
      <TooltipComponent content="Redo" side="right">
        <button
          className="rounded bg-zinc-600 bg-gradient-to-br p-2 py-4 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500 sm:py-2"
          onClick={() => Redo()}
        >
          <ArrowUturnRightIcon className="h-6 w-6" />
        </button>
      </TooltipComponent>
      <TooltipComponent content="Details" side="right">
        <button
          className="rounded bg-zinc-600 bg-gradient-to-br p-2 py-4 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500 sm:py-2"
          onClick={GoToDetails}
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </button>
      </TooltipComponent>
    </div>
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
          <title>You are not signed in | War Manager</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SignInModal redirectUrl={`/dashboard`} />
      </SignedOut>
    </>
  );
};

export default BlueprintPage;
