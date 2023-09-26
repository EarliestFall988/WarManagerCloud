import { create } from "zustand";

import { persist } from "zustand/middleware";

// import * as Y from "yjs";

import {
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

import type { Blueprint } from "@prisma/client";
// import { api } from "~/utils/api";

export interface IFlowInstance {
  nodes: Node[]; //<any>[]??
  edges: Edge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

// import initialNodes from "./nodes";
// import initialEdges from "./edges";

const nodes: Node[] = [];

const edges: Edge[] = [];

// const getNodes = () => {
//   const nodes = yFlowInstance.get("nodes");
//   if (nodes) {
//     return JSON.parse(nodes) as Node[];
//   }
//   return [];
// };

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  id: string;
};

type BlueprintState = {
  blueprintId: string;
  blueprintInstance: Blueprint;
  isLoading: boolean;
  isError: boolean;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create(
  persist<RFState>(
    (set, get) => ({
      nodes: nodes, //initialNodes as
      edges: edges,
      id: "",
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },
    }),
    {
      name: "reactflow-state",
    }
  )
);
const useBlueprintStore = create<BlueprintState>((set) => ({
  blueprintId: "",
  blueprintInstance: {
    id: "",
    name: "",
    description: "",
    data: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: "",
    pinned: false,
    live: false,
    markAsDeleted: false,
  },

  isLoading: true,
  isError: false,

  onSetBlueprintId: (blueprintId: string) => {
    set({
      blueprintId: blueprintId,
    });
  },

  onSetBlueprintInstance: (blueprintInstance: Blueprint) => {
    set({
      blueprintInstance: blueprintInstance,
    });
  },
}));

// const LoadBlueprintData = (blueprintId: string) => {
//   if (blueprintId === "" || !blueprintId) {
//     return;
//   }

//   // if (useBlueprintStore.getState().blueprintId === blueprintId) return;

//   const { data, isLoading, isError } = api.blueprints.getOneById.useQuery({
//     blueprintId,
//   });

//   if (data) {
//     useBlueprintStore.setState({
//       blueprintId,
//       blueprintInstance: data,
//       isLoading,
//       isError,
//     });

//     const blueprint = JSON.parse(data.data) as IFlowInstance;

//     if (!blueprint) return;

//     if (nodes.length > 0 || edges.length > 0) {
//       return;
//     }

//     useStore.setState({
//       nodes: blueprint.nodes,
//       edges: blueprint.edges,
//     });

//     yFlowInstance.set("nodes", blueprint.nodes);
//     yFlowInstance.set("edges", blueprint.edges);
//   }
// };

export { useStore, useBlueprintStore };

export const GetSelectedNodes = () => {
  const nodes = useStore.getState().nodes;
  const selectedNodes = nodes.filter((node) => node.selected === true);
  return selectedNodes;
};

export const GetSelectedEdges = () => {
  const edges = useStore.getState().edges;
  const selectedEdges = edges.filter((edge) => edge.selected === true);
  return selectedEdges;
};

export const DeleteSelected = () => {
  DeleteEdgesOfSelectedNodes();
  DeleteSelectedNodes();
  DeleteSelectedEdges();
};

const DeleteSelectedNodes = () => {
  const selectedNodes = GetSelectedNodes();

  useStore.setState((state: RFState) => ({
    nodes: state.nodes.filter((node) => !selectedNodes.includes(node)),
  }));
};

export const GetListOfNodesSortedByRow = () => {
  const nodes = useStore.getState().nodes;
  const nodesSortedByRow = nodes.sort((a, b) => {
    const yRow = a.position.y - b.position.y;

    if (yRow !== 0) {
      return yRow;
    } else {
      return a.position.x - b.position.x;
    }
  });

  return nodesSortedByRow;
};

// export const GetListOfNodesSortedByColumn = () => {
//   const nodes = useStore.getState().nodes;
//   const nodesSortedByColumn = nodes.sort((a, b) => {
//     const xCol = a.position.x - b.position.x;

//     if (xCol !== 0) {
//       return xCol;
//     } else {
//       return a.position.y - b.position.y;
//     }
//   });

//   console.log("sorted by column", nodesSortedByColumn);

//   return nodesSortedByColumn;
// };

const DeleteEdgesOfSelectedNodes = () => {
  const selectedNodeIds = GetSelectedNodes().map((node) => node.id);
  const selectedEdges = useStore.getState().edges.filter((edge) => {
    return (
      selectedNodeIds.includes(edge.source) ||
      selectedNodeIds.includes(edge.target)
    );
  });

  useStore.setState((state: RFState) => ({
    edges: state.edges.filter((edge) => !selectedEdges.includes(edge)),
  }));
};

const DeleteSelectedEdges = () => {
  const selectedEdges = GetSelectedEdges();
  useStore.setState((state: RFState) => ({
    edges: state.edges.filter((edge) => !selectedEdges.includes(edge)),
  }));
};
