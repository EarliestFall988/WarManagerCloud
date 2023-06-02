import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "reactflow";
import { shallow } from "zustand/shallow";

import "reactflow/dist/style.css";

import { useStore } from "../../states/state";

import crewNode from "~/components/crewNode";
import projectNode from "~/components/projectNode";
import { api } from "~/utils/api";

export type flowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

const selector = (state: flowState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const nodeTypes = {
  crewNode,
  projectNode,
};

const Flow = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    shallow
  );

  const { data: crewData } = api.crewMembers.getAll.useQuery();
  const { data: projectData } = api.projects.getAll.useQuery();

  const reactFlowWrapper: React.LegacyRef<HTMLDivElement> = useRef(null);
  const reactFlowInstance = useReactFlow();

    
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer?.getData("application/reactflow");

      if (data == null) return;
      if (projectData == null) return;
      if (crewData == null) return;

      const type = data.split("-")[0];
      const dataId = data.split("-")[1];

      const blockResult = {
        type: type == "p" ? "projectNode" : "crewNode",
        data: {},
      };

      if (type == "p") {
        const project = projectData.find((project) => project.id == dataId);
        if (project == null) return;

        blockResult.data = project;
      }

      if (type == "c") {
        const crewMember = crewData.find(
          (crewMember) => crewMember.id == dataId
        );
        if (crewMember == null) return;
        blockResult.data = crewMember;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      });

      const res = crypto.getRandomValues(new Uint32Array(1))[0];

      if (res == null) return;

      const id = `${res}`;

      const newNode = {
        id,
        type: blockResult.type,
        position: {
          x: position.x,
          y: position.y,
        },
        data: blockResult.data,
      };

      useStore.setState((state) => ({
        ...state,
        nodes: [...state.nodes, newNode],
      }));
    },
    [crewData, projectData, reactFlowInstance]
  );

  return (
    <div
      className="h-[95vh] w-full bg-zinc-800 sm:h-[100vh]"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={onConnect}
        snapToGrid={true}
        snapGrid={[10, 10]}
        fitView
      >
        {" "}
        <Background
          id="1"
          gap={10}
          color="#333333"
          variant={BackgroundVariant.Cross}
        />
        <Background
          id="2"
          gap={100}
          offset={1}
          color="#444444"
          variant={BackgroundVariant.Lines}
        />
        {/* <MiniMap /> */}
        <Controls />
      </ReactFlow>
    </div>
  );
}
  
const FlowWithProvider = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
