import React, { useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type ReactFlowInstance,
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

import "reactflow/dist/style.css";

import crewNode from "~/components/crewNode";
import projectNode from "~/components/projectNode";
import noteNode from "~/components/noteNode";
import equipmentNode from "~/components/equipmentNode";
import { api } from "~/utils/api";
import useEdgesStateSynced from "~/flow/useEdgesStateSynced";
import useNodesStateSynced, { nodesMap } from "~/flow/useNodesStateSynced";
import { toast } from "react-hot-toast";
import useLiveData from "./databank";
// import getDoc, { Init, isLoaded } from "./flowDocument";
// import { LoadingSpinner } from "~/components/loading";
// import { setName } from "~/flow/flowDocument";

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
  equipmentNode,
};

// type yjsWsProviderProps = {
//   status: string;
// };

const proOptions = {
  account: "paid-pro",
  hideAttribution: true,
};

// const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";

const Flow: React.FC<{
  blueprintId: string;
  blueprintData: string;
}> = ({ blueprintId, blueprintData }) => {
  // const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
  //   selector,
  //   shallow
  // );

  // const name = window.location.pathname.split("/")[2];
  // if (name != null) setName(name);

  const [nodes, onNodesChange] = useNodesStateSynced(blueprintId);
  const [edges, onEdgesChange, onConnect] = useEdgesStateSynced(blueprintId);

  // const { data: crewData } = api.crewMembers.getAll.useQuery(); //could be inefficient to fetch all crew members and projects for every blueprint - TODO fix
  // const { data: projectData } = api.projects.getAll.useQuery();
  const { data: noteData } = api.notes.getAll.useQuery({});
  const { crewData, projectData, equipmentData } = useLiveData();

  const reactFlowWrapper: React.LegacyRef<HTMLDivElement> = useRef(null);
  const reactFlowInstance = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // React.useMemo(() => {
  //   FlowChange(GetNodes(blueprintId));
  // }, [blueprintId, FlowChange]);

  useMemo(() => {
    if (blueprintData == null) return;

    const data = JSON.parse(blueprintData) as ReactFlowInstance;

    console.log("data", data);
  }, [blueprintData]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer?.getData("application/reactflow");

      if (data == null) return;
      if (projectData == null) return;
      if (crewData == null) return;
      if (equipmentData == null) return;

      const type = data.split("-")[0];
      const dataId = data.split("-")[1];

      const blockResult = {
        type:
          type == "p"
            ? "projectNode"
            : type == "c"
            ? "crewNode"
            : type == "e"
            ? "equipmentNode"
            : "noteNode",
        data: {},
      };

      if (type == "p") {
        const project = projectData.find((project) => project.id == dataId);
        if (!project) {
          console.log("no project found", dataId);
          toast.error("No project found");
          return;
        }

        blockResult.data = project;
      }

      if (type == "c") {
        const crewMember = crewData.find(
          (crewMember) => crewMember.id == dataId
        );
        if (!crewMember) {
          console.log("no crew member found", dataId);
          toast.error("No crew member found");
          return;
        }
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

      if (type === "e") {
        console.log("equipment", dataId);
        const equipment = equipmentData?.find(
          (equipment) => equipment.id == dataId
        );

        if (!equipment) return;
        blockResult.data = { ...equipment, blueprintId };
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

      nodesMap(blueprintId).set(id, newNode);
    },
    [
      crewData,
      projectData,
      reactFlowInstance,
      noteData,
      equipmentData,
      blueprintId,
    ]
  );

  return (
    <div className="h-[100vh] w-full bg-zinc-900 " ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={(e) => {
          onNodesChange(e);
        }}
        onEdgesChange={(e) => {
          onEdgesChange(e);
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onConnect={(e) => {
          onConnect(e);
        }}
        onNodesDelete={() => {
          // FlowChange(GetNodes(blueprintId));
        }}
        // onNodeClick={onNodeClick}
        proOptions={proOptions}
        snapToGrid={true}
        snapGrid={[20, 20]}
        selectNodesOnDrag={true}
      >
        {" "}
        <Background
          id="1"
          gap={20}
          color="#333333"
          variant={BackgroundVariant.Cross}
        />
        <Background
          id="2"
          gap={200}
          offset={1}
          color="#444444"
          variant={BackgroundVariant.Lines}
        />
        <div className="hidden md:block">
          <MiniMap />
          <Controls />
        </div>
      </ReactFlow>
    </div>
  );
};

export const FlowWithProvider: React.FC<{
  blueprintId: string;
  blueprintData: string;
}> = ({ blueprintId, blueprintData }) => {
  return (
    <ReactFlowProvider>
      <Flow blueprintId={blueprintId} blueprintData={blueprintData} />
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
