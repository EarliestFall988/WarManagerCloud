import { SignedIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  PaperAirplaneIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

import React, { useCallback, useRef, useState } from "react";

import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

// import './button.css';

import ResizableNodeSelected from "~/components/ResizableNodeSelected";
import crewNode from "~/components/crewNode";
import projectNode from "~/components/projectNode";

import {
  CrewList,
  ExportBlueprint,
  ProjectsList,
} from "~/components/auxilaryBlueprintEditingComponents";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

const nodeTypes = {
  ResizableNodeSelected,
  crewNode,
  projectNode,
};

const edgeOptions = {
  animated: true,
  style: {
    stroke: "white",
  },
};

const initialNodes = [
  {
    id: "1",
    type: "ResizableNodeSelected",
    position: { x: 0, y: 0 },
    data: { label: "Job 1", canResize: true },
  },
  {
    id: "2",
    type: "ResizableNodeSelected",
    position: { x: 0, y: 30 },
    data: { label: "Emp 1", canResize: true },
  },
  {
    id: "6",
    type: "ResizableNodeSelected",
    position: { x: 0, y: 60 },
    data: { label: "Emp 2", canResize: true },
  },
  // {
  //   id: "3",
  //   type: "default",
  //   width: 500,
  //   height: 500,
  //   position: { x: 300, y: 100 },
  // },
  // {
  //   id: "4",
  //   type: "default",
  //   width: 500,
  //   height: 500,
  //   position: { x: 500, y: 300 },
  // },
];
const initialEdges = [
  { id: "e1-2", source: "3", target: "4", type: "smoothstep" },
];

let nodeId = initialNodes.length;

const connectionLineStyle = { stroke: "white" };

// const saveBlueprint = (id: string, nodes: Node<any>[]) => {
//   console.log(id);
//   console.log(nodes);

// };

const Flow = function () {
  const reactFlowWrapper: React.LegacyRef<HTMLDivElement> = useRef(null);
  const [toggle, setToggle] = useState("");

  const { query } = useRouter();

  const blueprintId = query.blueprintid as string;

  const {
    data: nodeData,
    isLoading,
    isError,
  } = api.blueprints.getOneById.useQuery({
    blueprintId,
  });

  const reactFlowInstance = useReactFlow();

  const { data: crewData } = api.crewMembers.getAll.useQuery();
  const { data: projectData } = api.projects.getAll.useQuery();

  const { mutate: saveBlueprint, isLoading: saving } =
    api.blueprints.saveNodes.useMutation();

  const isSaving = saving;

  // console.log(reactFlowInstance.deleteElements);

  const onClick = useCallback(
    (keyword: string) => {
      if (keyword == "Project") {
        if (toggle == "Project") {
          setToggle(" ");
        } else {
          setToggle("Project");
        }
      }

      if (keyword == "Employee") {
        if (toggle == "Employee") {
          setToggle(" ");
        } else {
          setToggle("Employee");
        }
      }

      if (keyword == "GetLink") {
        if (toggle == "GetLink") {
          setToggle(" ");
        } else {
          setToggle("GetLink");
        }
      }
    },
    [setToggle, toggle] //make sure to add the reactFlowInstance if needed
  );

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

      const position = reactFlowInstance?.project({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      });

      const id = `${++nodeId}`;

      const newNode = {
        id,
        type: blockResult.type,
        position: {
          x: position.x,
          y: position.y,
        },
        data: blockResult.data,
      };

      reactFlowInstance?.addNodes(newNode);
    },
    [reactFlowInstance, crewData, projectData]
  );

  if (nodeData == null || isLoading || isError) return <LoadingPage />;
  if (crewData == null || projectData == null) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>{`${nodeData.name} (Blueprint) - War Manager`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="absolute inset-0 top-0 z-20 flex h-14 w-full items-center justify-between bg-zinc-700 p-2 px-5 text-gray-100 drop-shadow-md ">
        <Link
          className="text-md font-bold"
          href="/dashboard?context=Blueprints"
        >
          Back
        </Link>
        <div className="text-center text-sm font-semibold md:text-lg">
          {nodeData.name}
        </div>
        <button
          disabled={isSaving}
          className="btn-add rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
          onClick={() =>
            saveBlueprint({ blueprintId, nodes: reactFlowInstance?.toObject() })
          }
        >
          {!isSaving && <CloudArrowUpIcon className="h-6 w-6" />}
          {isSaving && (
            <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
              <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-amber-500" />
            </div>
          )}
        </button>
      </div>
      <SignedIn>
        <div className="h-screen w-screen bg-zinc-800" ref={reactFlowWrapper}>
          <ReactFlow
            defaultNodes={initialNodes}
            defaultEdges={initialEdges}
            defaultEdgeOptions={edgeOptions}
            fitView
            nodeTypes={nodeTypes}
            connectionLineStyle={connectionLineStyle}
            snapToGrid={true}
            snapGrid={[10, 10]}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <Background
              id="1"
              gap={10}
              color="#333333"
              variant={BackgroundVariant.Lines}
            />
            <Background
              id="2"
              gap={100}
              offset={1}
              color="#444444"
              variant={BackgroundVariant.Lines}
            />
          </ReactFlow>

          <div className="absolute right-0 top-20 flex gap-1 rounded bg-zinc-700 p-1 drop-shadow-md transition-all duration-100">
            {toggle === "GetLink" && <ExportBlueprint />}
            {toggle === "Project" && <ProjectsList />}
            {toggle === "Employee" && <CrewList />}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => onClick("GetLink")}
                className="btn-add z-20 rounded bg-gradient-to-br from-amber-700 to-red-600 p-2 text-white hover:scale-105"
              >
                <PaperAirplaneIcon className="h-6 w-6 -rotate-12" />
              </button>
              <button
                onClick={() => onClick("Project")}
                className="btn-add  z-20 rounded bg-zinc-500 p-2 hover:scale-105"
              >
                <WrenchScrewdriverIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => onClick("Employee")}
                className="btn-add  z-20 rounded bg-zinc-500 p-2 hover:scale-105"
              >
                <IdentificationIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

const BlueprintPage: NextPage = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default BlueprintPage;
