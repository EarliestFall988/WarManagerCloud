import { create } from "zustand";

import { persist } from "zustand/middleware";

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
import { api } from "~/utils/api";

interface IFlowInstance {
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
      nodes: nodes,
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

const LoadBlueprintData = (blueprintId: string) => {
  if (blueprintId === "" || !blueprintId) {
    return;
  }

  // if (useBlueprintStore.getState().blueprintId === blueprintId) return;

  const { data, isLoading, isError } = api.blueprints.getOneById.useQuery({
    blueprintId,
  });

  if (data) {
    useBlueprintStore.setState({
      blueprintId,
      blueprintInstance: data,
      isLoading,
      isError,
    });

    // console.log("restored data");
    // console.log(useBlueprintStore.getState().blueprintInstance);

    const flowInstance = useBlueprintStore.getState().blueprintInstance.data;
    const flow = JSON.parse(flowInstance) as IFlowInstance;

    if (
      useStore.getState().nodes.length === 0 &&
      useStore.getState().edges.length === 0
    ) {
      useStore.setState({
        nodes: flow.nodes,
        edges: flow.edges,
      });
    }
  }
};

export { useStore, useBlueprintStore, LoadBlueprintData };
