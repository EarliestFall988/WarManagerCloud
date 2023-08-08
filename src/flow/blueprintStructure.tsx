import { type Node } from "reactflow";
import useNodesStateSynced, { GetNodes, nodesMap } from "./useNodesStateSynced";
import useLiveData from "./databank";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/solid";
import TooltipComponent from "~/components/Tooltip";
import { api } from "~/utils/api";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { GetEdges } from "./useEdgesStateSynced";
import { useRouter } from "next/router";
import { LoadingSpinner } from "~/components/loading";
import { DialogComponent } from "~/components/dialog";
import { Disconnect } from "./ydoc";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type project = {
  id: string;
  name: string;
  crew: {
    id: string;
    name: string;
  }[];
};

type structure = {
  projects: project[];
  remainingNodes: remainingNode[];
};

type remainingNode = {
  id: string;
  name: string;
};

type projectNode = {
  id: string;
  data: {
    id: string;
  };
};

type crewNode = {
  id: string;
  data: {
    id: string;
  };
};

export const GetListOfNodesSortedByColumn = (blueprintId: string) => {
  const yMap = nodesMap(blueprintId);

  const nodes = [] as Node[];

  yMap.forEach((node) => {
    nodes.push(node);
  });

  const nodesSortedByColumn = nodes.sort((a, b) => {
    const xCol = a.position.x - b.position.x;

    if (xCol <= -15 || xCol >= 15) {
      return xCol;
    } else {
      return 0;
    }
  });

  //   console.log("sorted by column", nodesSortedByColumn);

  return nodesSortedByColumn;
};

export const GetListOfNodesSorted = (nodes: Node[]) => {
  const nodesSortedByColumn = nodes.sort((a, b) => {
    const xCol = a.position.x - b.position.x;

    if (xCol <= -15 || xCol >= 15) {
      return xCol;
    } else {
      return 0;
    }
  });

  //   console.log("sorted by column", nodesSortedByColumn);

  return nodesSortedByColumn;
};

const useCreateStructure = (n: Node[]) => {
  let s = {} as structure;
  const nodes = GetListOfNodesSorted(n);

  const { projectData, crewData, isLoading } = useLiveData();

  //   useEffect(() => {
  if (!nodes || isLoading || !projectData) return s;

  let currentProject = undefined as project | undefined;

  const structure = {
    projects: [] as project[],
    remainingNodes: [] as remainingNode[],
  };

  nodes.forEach((node) => {
    if (node.type === "projectNode") {
      const projectNode = node as projectNode;

      const info = projectData.find((node) => node.id == projectNode.data.id);
      if (!info) return;
      structure.projects.push({
        id: node.id,
        name: info.name,
        crew: [],
      });

      currentProject = structure.projects[structure.projects.length - 1];
    } else if (node.type === "crewNode") {
      const crewNode = node as crewNode;

      const info = crewData.find((node) => node.id == crewNode.data.id);
      if (!info) return;

      if (currentProject !== undefined) {
        currentProject.crew.push({
          id: node.id,
          name: info.name,
        });
      } else {
        const crewNode = node as crewNode;
        const info = crewData.find((node) => node.id == crewNode.id);
        if (!info) return;

        structure.remainingNodes.push({
          id: node.id,
          name: info.name,
        });
      }
    }
  });

  s = structure;
  //   }, [nodes, projectData, crewData, isLoading]);

  return s;
};

const Ribbon: React.FC<{
  blueprintId: string;
  liveData: boolean;
  name: string;
  description: string;
}> = ({ blueprintId, liveData, name, description }) => {
  const [Nodes] = useNodesStateSynced(blueprintId);
  useCreateStructure(Nodes);

  const router = useRouter();

  const [animationSaveParent] = useAutoAnimate();

  const backButton = () => {
    if (history.length > 0) router.back();
    else void router.push(`/dashboard/blueprints`);

    Disconnect();
  };

  const [goToGantt, setGoToGantt] = useState(false);
  const [back, setBack] = useState(false);

  const { mutate, isLoading: isSaving } = api.blueprints.save.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} saved successfully`);
      if (goToGantt) {
        setGoToGantt(false);
        void router.push(`/blueprints/${data.id}/gantt`);
        Disconnect();
      }

      if (back) {
        setBack(false);
        backButton();
      }
    },

    onError: (error) => {
      setGoToGantt(false);
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

    mutate({ blueprintId, flowInstanceData: flowInstance, live: liveData });
  }, [mutate, blueprintId, liveData]);

  const OnScheduleTime = useCallback(() => {
    if (!blueprintId) return;

    setGoToGantt(true);
    onSave();
  }, [blueprintId, onSave]);

  console.log("livedata from ribbon", liveData);

  return (
    <div className="absolute inset-0 top-0 z-20 flex h-12 w-full items-center justify-between bg-zinc-700 p-1 text-gray-100 drop-shadow-md ">
      <div className="flex w-1/2 items-center justify-start gap-4 sm:w-1/3">
        <DialogComponent
          title="Save changes?"
          description="Do you want to push your changes to the cloud before leaving?"
          yes={() => {
            setBack(true);
            onSave();
          }}
          no={backButton}
          highlightYes={true}
          trigger={
            <div className="cursor-pointer rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500">
              {isSaving && back ? (
                <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
              ) : (
                <ArrowLeftIcon className="h-6 w-6" />
              )}
            </div>
          }
        />

        <div className="max-w-1/2 truncate rounded p-1 text-center text-sm font-semibold tracking-tight text-zinc-200 md:text-lg">
          {name ? (
            <div className="flex select-none items-center gap-1 py-1">
              {liveData ? (
                <TooltipComponent content="Live Data" side="bottom">
                  <CheckBadgeIcon className="inline-block h-4 w-4 text-zinc-300" />
                </TooltipComponent>
              ) : (
                <div>
                  <TooltipComponent content="Zen Mode" side="bottom">
                    <PaintBrushIcon className="inline-block h-4 w-4 text-zinc-300" />
                  </TooltipComponent>
                </div>
              )}
              <TooltipComponent
                content={description || "<no description>"}
                side="bottom"
              >
                <p>{isSaving ? `Saving ${name}` : name}</p>
              </TooltipComponent>
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      {name && (
        <div className="flex w-1/2 items-center justify-end gap-1 sm:w-1/3 sm:gap-2">
          <TooltipComponent
            content="Share blueprint with other managers (link)"
            side="bottom"
            disableToolTipIfNoContent={true}
          >
            <button
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
              className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
              onClick={() => {
                setGoToGantt(false);
                onSave();
              }}
            >
              <div ref={animationSaveParent}>
                {!isSaving && <CloudArrowUpIcon className="h-6 w-6" />}
                {isSaving && (
                  <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
                    <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
                  </div>
                )}
              </div>
            </button>
          </TooltipComponent>
          <TooltipComponent
            content="Adjust Time for Each Crew Member"
            side="bottom"
          >
            <button
              onClick={OnScheduleTime}
              className={`flex items-center gap-2 rounded bg-green-700 p-2 text-white transition duration-300 hover:scale-105 hover:bg-green-500 focus:scale-105 focus:bg-green-500`}
            >
              {isSaving && goToGantt ? (
                <p>Saving...</p>
              ) : (
                <>
                  <p>Next</p>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </TooltipComponent>
        </div>
      )}
    </div>
  );
};

export default Ribbon;
