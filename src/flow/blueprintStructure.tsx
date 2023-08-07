import { type Node } from "reactflow";
import useNodesStateSynced, { GetNodes, nodesMap } from "./useNodesStateSynced";
import useLiveData from "./databank";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/solid";
import TooltipComponent from "~/components/Tooltip";
import { api } from "~/utils/api";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { GetEdges } from "./useEdgesStateSynced";
import { useRouter } from "next/router";

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

const SaveButton: React.FC<{
  blueprintId: string;
}> = ({ blueprintId }) => {
  const [Nodes] = useNodesStateSynced(blueprintId);
  useCreateStructure(Nodes);

  const { push } = useRouter();

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

  const OnScheduleTime = useCallback(() => {
    if (!blueprintId) return;
    onSave();
    void push(`/blueprints/${blueprintId}/gantt`);
  }, [blueprintId, onSave, push]);

  return (
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
          className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
          onClick={onSave}
        >
          {!isSaving && <CloudArrowUpIcon className="h-6 w-6" />}
          {isSaving && (
            <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
              <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
            </div>
          )}
        </button>
      </TooltipComponent>
      <TooltipComponent
        content="Adjust Time for Each Crew Member"
        side="bottom"
      >
        <button
          onClick={OnScheduleTime}
          className="flex items-center gap-2 rounded bg-green-700 p-2 text-white transition duration-100 hover:scale-105 hover:bg-green-500 focus:scale-105 focus:bg-green-500"
        >
          <p>Next</p>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </TooltipComponent>
    </>
  );
};

export default SaveButton;
