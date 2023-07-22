import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  NodeMouseHandler,
  ReactFlowProvider,
  // applyNodeChanges,
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
import noteNode from "~/components/noteNode";
import { api } from "~/utils/api";
import useEdgesStateSynced from "~/flow/useEdgesStateSynced";
import useNodesStateSynced, { nodesMap } from "~/flow/useNodesStateSynced";
// import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
// import { WebrtcProvider } from "y-webrtc";

export type flowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

// const selector = (state: flowState) => ({
//   nodes: state.nodes,
//   edges: state.edges,
//   onNodesChange: state.onNodesChange,
//   onEdgesChange: state.onEdgesChange,
//   onConnect: state.onConnect,
// });

const nodeTypes = {
  crewNode,
  projectNode,
  noteNode,
};

// type yjsWsProviderProps = {
//   status: string;
// };

const proOptions = {
  account: "paid-pro",
  hideAttribution: true,
};

// const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";

const Flow: React.FC<{ blueprintId: string }> = ({ blueprintId }) => {
  // const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
  //   selector,
  //   shallow
  // );

  const [nodes, onNodesChange] = useNodesStateSynced();
  const [edges, onEdgesChange, onConnect] = useEdgesStateSynced();

  // console.log("nodes", nodes);

  // const roomName = blueprintId;

  const { data: crewData } = api.crewMembers.getAll.useQuery();
  const { data: projectData } = api.projects.getAll.useQuery();
  const { data: noteData } = api.notes.getAll.useQuery({});

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
        type:
          type == "p" ? "projectNode" : type == "c" ? "crewNode" : "noteNode",
        data: {},
      };

      if (type == "p") {
        const project = projectData.find((project) => project.id == dataId);
        if (!project) return;

        blockResult.data = project;
      }

      if (type == "c") {
        const crewMember = crewData.find(
          (crewMember) => crewMember.id == dataId
        );
        if (!crewMember) return;
        blockResult.data = crewMember;
      }

      if (type == "n") {
        console.log("node", dataId);
        const note = noteData?.find((note) => note.id == dataId);

        // console.log("note", note)

        if (!note) return;
        blockResult.data = { ...note, blueprintId };

        // console.log(blockResult);
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

      // useStore.setState((state) => ({
      //   ...state,
      //   nodes: [...state.nodes, newNode],
      // }));

      nodesMap.set(id, newNode);

    },
    [crewData, projectData, reactFlowInstance, noteData, blueprintId]
  );

  // We are adding a blink effect on click that we remove after 3000ms again.
  // This should help users to see that a node was clicked by another user.
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const currentNode = nodesMap.get(node.id);
    if (currentNode) {
      nodesMap.set(node.id, {
        ...currentNode,
        className: "animate-blink",
      });
    }

    window.setTimeout(() => {
      const currentNode = nodesMap.get(node.id);
      if (currentNode) {
        nodesMap.set(node.id, {
          ...currentNode,
          className: undefined,
        });
      }
    }, 3000);
  }, []);

  return (
    <div className="h-[100vh] w-full bg-zinc-800 " ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        proOptions={proOptions}
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
};

export const FlowWithProvider: React.FC<{ blueprintId: string }> = ({
  blueprintId,
}) => {
  return (
    <ReactFlowProvider>
      <Flow blueprintId={blueprintId} />
    </ReactFlowProvider>
  );
};

export default FlowWithProvider;

// const FlowPage: NextPage = () => {

//   const router = useRouter();

//   useEffect(() => {

//     void router.push(`/404`)

//   }, [router]);

//   return (
//     <>
//       <LoadingPage />
//     </>
//   )
// }

// export default FlowPage;
