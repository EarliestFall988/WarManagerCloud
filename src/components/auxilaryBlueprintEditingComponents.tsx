import React from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import { Blueprint } from "@prisma/client";
import { Edge, Node } from "reactflow";
import { RectangleGroupIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeData: string
) => {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData("application/reactflow", nodeData);
  event.dataTransfer.effectAllowed = "move";
};

export const ProjectsList = () => {
  const { data, isLoading, isError } = api.projects.getAll.useQuery();

  const draggable = !isError && !isLoading && data !== undefined;

  return (
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
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
            className="t flex items-center justify-between bg-zinc-600 px-2 text-left hover:bg-zinc-500"
            key={project.id}
            draggable={draggable}
            onDragStart={(event) => onDragStart(event, "p-" + project.id)}
          >
            <p className="truncate py-2 text-sm sm:w-1/2 sm:text-lg">
              {project.name}
            </p>
            <p className="hidden w-1/2 truncate text-ellipsis  font-normal italic tracking-tight sm:flex">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CrewList = () => {
  const { data, isLoading, isError } = api.crewMembers.getAll.useQuery();

  const draggable = !isError && !isLoading && data !== undefined;

  return (
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg">Crew Members</h1>

      <div className="flex flex-col gap-1 pr-1">
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center  py-5">
            <LoadingSpinner />
          </div>
        )}
        {isError && <div>Something went wrong</div>}
        {data?.map((crew) => (
          <div
            className="t flex items-center justify-between bg-zinc-600 px-2 text-left hover:bg-zinc-500"
            key={crew.id}
            draggable={draggable}
            onDragStart={(event) => onDragStart(event, "c-" + crew.id)}
          >
            <p className="truncate py-2 text-sm sm:w-1/2 sm:text-lg">
              {crew.name}
            </p>
            <p className="hidden w-1/2 truncate text-ellipsis font-normal italic tracking-tight sm:flex">
              {crew.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExportBlueprint = () => {
  // const { data, isLoading, isError } = api.crewMembers.getAll.useQuery();

  // console.log(data);

  return (
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
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
  nodes: Node<any>[];
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
      <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
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
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
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
    <div className="h-[80vh] w-[55vw] border-r-2 border-zinc-600 md:w-[30vw]">
      <h1 className="w-full text-center font-bold sm:text-lg">More</h1>

      <div className="flex justify-center gap-1 p-1">
        <div className="flex h-32 items-center justify-center p-5">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};
