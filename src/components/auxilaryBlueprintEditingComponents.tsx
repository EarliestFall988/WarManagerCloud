import React from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";


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
