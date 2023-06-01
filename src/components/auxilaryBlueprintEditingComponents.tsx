import React from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import type { Blueprint } from "@prisma/client";
import type { Edge, Node } from "reactflow";
import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import useScript from "./dragDropTouchEventsHandling";

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeData: string
) => {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData("application/reactflow", nodeData);
  event.dataTransfer.effectAllowed = "move";
};

export const ProjectsList = () => {
  useScript(
    "https://bernardo-castilho.github.io/DragDropTouch/DragDropTouch.js"
  );

  const { data, isLoading, isError } = api.projects.getAll.useQuery();

  const draggable = !isError && !isLoading && data !== undefined;

  return (
    <div className="mr-1 h-[60vh] w-[80vw] border-r border-zinc-600 sm:m-0 md:h-[85vh] md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg ">Projects</h1>
      <div className="flex flex-col gap-1 pr-1">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center  py-5">
            <LoadingSpinner />
          </div>
        )}
        {isError && <div>Something went wrong</div>}
        {data?.map((project) => (
          <div
            className="flex items-end justify-between border-b border-zinc-600 p-1 px-2 text-left transition-all duration-100 hover:-translate-x-2 hover:scale-105 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
            key={project.id}
            draggable={draggable}
            onDragStart={(event) => onDragStart(event, "p-" + project.id)}
          >
            <div className="w-2/3 truncate ">
              <p className="truncate text-sm sm:text-lg">{project.name}</p>
              <p className="truncate text-sm font-normal italic tracking-tighter text-zinc-300">
                {project.city} {project.city && ","} {project.state}
              </p>
            </div>
            <p className="hidden w-1/2 text-sm font-normal italic tracking-tight text-zinc-300 sm:flex">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CrewList = (props: { nodes: Node[] }) => {
  const [nodeMode, setNodeMode] = React.useState<"all" | "notOnBlueprint">(
    "notOnBlueprint"
  );

  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const { data, isLoading, isError } = api.crewMembers.getAll.useQuery();
  const { data: searchResult, isLoading: loadingSearch } =
    api.crewMembers.getByName.useQuery({
      name: searchTerm,
    });

  console.log(searchTerm);
  console.log(searchResult);

  let dataToUse = data;

  if (searchTerm) {
    dataToUse = searchResult;
  }

  const currentNodes = props.nodes;

  const nodesNotInUse = dataToUse?.filter((crew) => {
    if (
      currentNodes.find((node) => {
        if (node.type === "crewNode") {
          const nodeData = node.data as { id: string };
          if (nodeData.id === crew.id) {
            return true;
          }
        }
        return false;
      })
    )
      return false;
    return true;
  });

  if (nodeMode === "notOnBlueprint") {
    dataToUse = nodesNotInUse;
  }

  const draggable = !isError && !isLoading && data !== undefined;

  return (
    <div className="mr-1 h-[60vh] w-[80vw] border-r border-zinc-600 sm:m-0 md:h-[85vh] md:w-[30vw]">
      <div className="flex justify-between border-b border-zinc-600 p-1">
        {/* <button
          onClick={}
          className="rounded bg-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button> */}
        <h1 className="w-full  px-2 text-center font-bold sm:text-lg">
          Crew Members
        </h1>
      </div>
      {(isLoading || loadingSearch) && (
        <div className="flex h-full w-full items-center justify-center  py-5">
          <LoadingSpinner />
        </div>
      )}
      {isError && <div>Something went wrong</div>}
      {!(isLoading || loadingSearch) && (
        <>
          <div className="flex items-center gap-2 border-b border-zinc-600 p-2">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="search"
              className="w-full rounded bg-zinc-100 p-1 text-zinc-600 placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none"
              placeholder="Search..."
            />
            <div className="flex gap-1">
              <button
                onClick={() => setNodeMode("all")}
                className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${
                  nodeMode === "all" ? "bg-zinc-600" : ""
                }`}
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setNodeMode("notOnBlueprint")}
                className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${
                  nodeMode === "notOnBlueprint" ? "bg-orange-600" : ""
                }`}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {dataToUse?.length === 0 && (
            <NothingToDisplayNotice context="crew members" />
          )}
          {dataToUse?.map((crew) => (
            <div
              className="flex items-end justify-between border-b border-zinc-600 p-1 px-2 text-left transition-all duration-100 hover:-translate-x-2 hover:scale-105 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
              key={crew.id}
              draggable={draggable}
              onDragStart={(event) => onDragStart(event, "c-" + crew.id)}
            >
              <div className="w-2/3 truncate ">
                <p className="truncate text-sm sm:text-lg">{crew.name}</p>
                <p className="truncate text-sm font-normal italic text-zinc-300">
                  {crew.position}
                </p>
              </div>
              <p className="hidden w-1/2 text-sm font-normal italic tracking-tight text-zinc-300 sm:flex">
                {crew.description}
              </p>
            </div>
          ))}
          {nodesNotInUse?.length == 0 && dataToUse?.length === 0 && (
            <AllOnBlueprintNotice context="crew members" />
          )}
        </>
      )}
    </div>
  );
};

const AllOnBlueprintNotice = (props: { context: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-5">
      <p className="text-center text-zinc-400">
        All {props.context} are on the Blueprint
      </p>
      <RocketLaunchIcon className="h-10 w-10 text-zinc-400" />
    </div>
  );
};

const NothingToDisplayNotice = (props: { context: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5  py-2">
      <p className="text-center text-zinc-400">No {props.context} found </p>
    </div>
  );
};

export const ExportBlueprint = () => {
  // const { data, isLoading, isError } = api.crewMembers.getAll.useQuery();

  // console.log(data);

  return (
    <div className="h-[80vh] w-[55vw] border-r border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg">
        Export Schedule
      </h1>

      <div className="flex flex-col gap-1 pr-1">
        <div className="p-4" />
        <input
          type="text"
          placeholder="title"
          className="rounded p-2 text-zinc-700 outline-none disabled:text-black"
          disabled={true}
        />
        <button
          disabled={true}
          className="rounded bg-gradient-to-br from-amber-700 to-red-700 p-2 font-semibold text-white hover:from-amber-600 hover:to-red-600 disabled:bg-red-500"
        >
          Export Schedule
        </button>
        <div className="flex h-full w-full items-center justify-center  py-5">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};

interface IFlowInstance {
  nodes: Node[];
  edges: Edge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export const Stats = (props: { blueprint: Blueprint }) => {
  const data = JSON.parse(props.blueprint?.data) as IFlowInstance;

  if (data == null || data.nodes === undefined)
    return (
      <div className="h-[80vh] w-[55vw] border-r border-zinc-600 md:w-[30vw]">
        <h1 className="w-full text-center font-bold sm:text-lg">
          Blueprint Statistics
        </h1>
        <div>
          <p className="p-4 text-center italic text-zinc-400">
            {"nothing to show :)"}
          </p>
          <RocketLaunchIcon className="mx-auto h-1/2 w-1/2 text-zinc-800/10" />
        </div>
      </div>
    );

  const crewCount = data.nodes.filter(
    (node) => node.type === "crewNode"
  ).length;

  const projectCount = data.nodes.filter(
    (node) => node.type === "projectNode"
  ).length;

  return (
    <div className="h-[80vh] w-[55vw] border-r border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg">
        Blueprint Statistics
      </h1>

      <div className="flex flex-col gap-1 p-1">
        <div>
          <p className="font-semibold">Crew Count</p>
          <p> {crewCount} </p>
        </div>
        <div></div>
        <div>
          <p className="font-semibold">Project Count</p>
          <p> {projectCount} </p>
        </div>
      </div>
    </div>
  );
};

export const More = () => {
  return (
    <div className="h-[80vh] w-[55vw] border-r border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg">More</h1>

      <div className="flex justify-center gap-1 p-1">
        <div className="flex h-32 items-center justify-center p-5">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};
