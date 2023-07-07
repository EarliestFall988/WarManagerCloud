import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
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
  noteNode,
};

// type yjsWsProviderProps = {
//   status: string;
// };



// const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";

const Flow: React.FC<{ blueprintId: string }> = ({ blueprintId }) => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    selector,
    shallow
  );

  // console.log("nodes", nodes);

  // const roomName = blueprintId;

  const { data: crewData } = api.crewMembers.getAll.useQuery();
  const { data: projectData } = api.projects.getAll.useQuery();
  const { data: noteData } = api.notes.getAll.useQuery({});

  // const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  // // const [text, setText] = useState("");
  // const [ws, setws] = useState<WebsocketProvider | null>(null);
  // const [wrtc, setwrtc] = useState<WebrtcProvider | null>(null);

  const reactFlowWrapper: React.LegacyRef<HTMLDivElement> = useRef(null);
  const reactFlowInstance = useReactFlow();

  // useEffect(() => {
  //   const ydoc = new Y.Doc();

  //   const wsProvider = new WebsocketProvider(
  //     liveWebRTCConnection,
  //     roomName,
  //     ydoc
  //   );

  //   const webrtcProvider = new WebrtcProvider(roomName, ydoc, {
  //     signaling: [liveWebRTCConnection],
  //     password: "password",
  //   });

  //   wsProvider.on("status", (event: yjsWsProviderProps) => {
  //     console.log(event.status); // logs "connected" or "disconnected"
  //   });

  //   setwrtc(webrtcProvider);

  //   wsProvider.on("sync", (isSynced: yjsWsProviderProps) => {
  //     console.log(isSynced); // logs "true" or "false"

  //     if (isSynced) {
  //       const text = ydoc?.getText("text").toJSON();
  //       // console.log('text', text)
  //       // setText(text || "");
  //     }
  //   });

  //   webrtcProvider.on("sync", (isSynced: yjsWsProviderProps) => {
  //     console.log("web rtc synced: ", isSynced); // logs "true" or "false"
  //   });

  //   ydoc.on("update", (_update: Uint8Array) => { // update: Uint8Array
  //     // console.log('update', update)
  //     const text = ydoc?.getText("nodes").toJSON();
  //     // console.log('text', text)
  //     // setText(text || "");

  //     // const nodes = JSON.parse(text || "[]");
  //   });

  //   setYdoc(ydoc);
  //   setws(wsProvider);

  //   return () => {
  //     wsProvider.disconnect();
  //     ydoc.destroy();
  //   };
  // }, []);



  // useEffect(() => {

  //   const text = JSON.stringify(nodes);

  //   if (!ydoc) return;

  //   Y.transact(ydoc, () => {
  //     ydoc?.getText("nodes").delete(0, ydoc?.getText("nodes").length);
  //     ydoc?.getText("nodes").insert(0, text);
  //   });

  //   

  // });



  // const update = (text: string) => {
  //   // console.log('updateText', text)
  //   if (!ydoc) return;

  //   setText(text);
  // };

  // console.log("flow instance", reactFlowInstance);

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
        type: type == "p" ? "projectNode" : (type == "c" ? "crewNode" : "noteNode"),
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
        const note = noteData?.find(
          (note) => note.id == dataId
        )

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

      useStore.setState((state) => ({
        ...state,
        nodes: [...state.nodes, newNode],
      }));
    },
    [crewData, projectData, reactFlowInstance, noteData, blueprintId]
  );

  return (
    <div className="h-[100vh] w-full bg-zinc-800" ref={reactFlowWrapper}>
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
};

export const FlowWithProvider: React.FC<{ blueprintId: string }> = ({ blueprintId }) => {
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
