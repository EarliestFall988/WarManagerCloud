import React, { useCallback, useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import type { Blueprint, CrewMember, Project } from "@prisma/client";
import type { Edge, Node } from "reactflow";
import {
  ArrowUpLeftIcon,
  ArrowUpOnSquareIcon,
  ArrowUpRightIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QueueListIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import useScript from "./dragDropTouchEventsHandling";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { User } from "@clerk/nextjs/server";
import { GetListOfNodesSortedByColumn } from "~/states/state";

const onDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  nodeData: string
) => {
  if (!event.dataTransfer) return;

  event.dataTransfer.setData("application/reactflow", nodeData);
  event.dataTransfer.effectAllowed = "move";
};

const filterProjectsNotOnBlueprint = (nodes: Node[]) => {
  const projectNodes = nodes.find((node) => node.type === "project");

  return [] as Project[]; // nodes.filter((node) => node.type !== "project") as Project[];
};

export const ProjectsList = (props: { nodes: Node[] }) => {
  useScript(
    "https://bernardo-castilho.github.io/DragDropTouch/DragDropTouch.js"
  );

  const [search, setSearch] = useState("");
  const [nodeMode, setNodeMode] = useState<
    "all" | "notOnBlueprint" | "onlyOnBlueprint"
  >("notOnBlueprint");

  const { data, isLoading, isError } = api.projects.getAll.useQuery();

  const {
    data: searchedProjects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
  } = api.projects.getByNameOrJobCode.useQuery({
    name: search,
  });

  console.log(searchedProjects);

  const draggable = !isError && !isLoading && data !== undefined;

  const getProjectsToView = () => {
    if (nodeMode === "all" && !isLoadingProjects && !isErrorProjects) {
      return searchedProjects || ([] as Project[]);
    } else if (nodeMode === "notOnBlueprint") {
      return filterProjectsNotOnBlueprint(props.nodes) || ([] as Project[]);
    } else if (nodeMode === "onlyOnBlueprint") {
      const nodes = props.nodes.filter((node) => node.type === "project");

      const projects = data?.filter((project) => {
        return nodes.some((node) => {
          const nodeProject = node.data as Project;
          return nodeProject.id === project.id;
        });
      });

      return projects || ([] as Project[]);
    } else {
      return [] as Project[];
    }
  };

  const projectsToView = getProjectsToView();

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <div className="flex items-center justify-between border-b border-zinc-600 p-1 ">
        <div className="flex gap-1">
          <Link
            href="/newproject"
            className="rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex w-full items-center justify-center gap-1 px-2 text-center text-xs font-bold sm:text-lg">
          {nodeMode === "all" && <p>All</p>}
          <p>Projects</p>
          {nodeMode === "notOnBlueprint" && (
            <p>
              <span className="text-orange-500">Not</span> on Blueprint
            </p>
          )}
          {nodeMode === "onlyOnBlueprint" && (
            <p>
              <span className="text-blue-500">Only</span> on Blueprint
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setNodeMode("all")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${
              nodeMode === "all" ? "bg-zinc-600" : ""
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setNodeMode("notOnBlueprint")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-orange-500 ${
              nodeMode === "notOnBlueprint" ? "bg-orange-600" : ""
            }`}
          >
            <QueueListIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setNodeMode("onlyOnBlueprint")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-blue-500 ${
              nodeMode === "onlyOnBlueprint" ? "bg-blue-600" : ""
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end border-b border-zinc-600 p-1 py-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          className="w-full rounded bg-zinc-100 p-1 text-zinc-600 placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none"
          placeholder="Search..."
        />
      </div>
      <div className="flex flex-col gap-1 pr-1">
        {!(isLoading || isLoadingProjects) && (
          <>
            {projectsToView?.length === 0 && (
              <NothingToDisplayNotice context="projects" />
            )}
            {projectsToView?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div
                  className="flex items-end justify-between border-b border-zinc-600 p-1 px-2 text-left transition-all duration-200 hover:-translate-y-1 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
                  draggable={draggable}
                  onDragStart={(event) => onDragStart(event, "p-" + project.id)}
                >
                  <div className="w-2/3 truncate ">
                    <p className="truncate text-sm sm:text-lg">
                      {project.name}
                    </p>
                    <p className="truncate text-sm font-normal italic text-zinc-300">
                      {project.city}, {project.state || "N/A"}
                    </p>
                  </div>
                  <p className="hidden w-1/2 text-sm font-normal italic tracking-tight text-zinc-300 sm:flex">
                    {project.description}
                  </p>
                </div>
              </Link>
            ))}
            {projectsToView?.length === 0 && nodeMode === "notOnBlueprint" && (
              <AllOnBlueprintNotice context="projects" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const filterCrewMembers = (props: {
  nodes: Node[];
  data: CrewMember[] | undefined;
}) => {
  const { data } = props;

  const currentNodes = props.nodes;

  const nodesNotInUse = data?.filter((crew) => {
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

  return nodesNotInUse;
};

export const CrewList = (props: { nodes: Node[] }) => {
  useScript(
    "https://bernardo-castilho.github.io/DragDropTouch/DragDropTouch.js"
  );

  const [nodeMode, setNodeMode] = React.useState<
    "all" | "notOnBlueprint" | "onlyOnBlueprint"
  >("notOnBlueprint");

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

  if (nodeMode === "notOnBlueprint") {
    dataToUse = filterCrewMembers({ nodes: currentNodes, data: dataToUse });
  } else if (nodeMode === "onlyOnBlueprint") {
    dataToUse = dataToUse?.filter((crew) => {
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
        return true;
      return false;
    });
  }

  const draggable = !isError && !isLoading && data !== undefined;

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <div className="flex items-center justify-between border-b border-zinc-600 p-1 ">
        <div className="flex gap-1">
          <Link
            href="/newCrewMember"
            className="rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
          >
            <PlusIcon className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex w-full items-center justify-center gap-1 px-2 text-center text-xs font-bold sm:text-lg">
          {nodeMode === "all" && <p>All</p>}
          <p>Crew Members</p>
          {nodeMode === "notOnBlueprint" && (
            <p>
              <span className="text-orange-500">Not</span> on Blueprint
            </p>
          )}
          {nodeMode === "onlyOnBlueprint" && (
            <p>
              <span className="text-blue-500">Only</span> on Blueprint
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setNodeMode("all")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${
              nodeMode === "all" ? "bg-zinc-600" : ""
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setNodeMode("notOnBlueprint")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-orange-500 ${
              nodeMode === "notOnBlueprint" ? "bg-orange-600" : ""
            }`}
          >
            <QueueListIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setNodeMode("onlyOnBlueprint")}
            className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-blue-500 ${
              nodeMode === "onlyOnBlueprint" ? "bg-blue-600" : ""
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end border-b border-zinc-600 p-1 py-2">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="search"
          className="w-full rounded bg-zinc-100 p-1 text-zinc-600 placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none"
          placeholder="Search..."
        />
      </div>
      {(isLoading || loadingSearch) && (
        <div className="flex items-center justify-center  py-5">
          <LoadingSpinner />
        </div>
      )}
      {isError && <div>Something went wrong</div>}
      {!(isLoading || loadingSearch) && (
        <>
          {dataToUse?.length === 0 && (
            <NothingToDisplayNotice context="crew members" />
          )}
          {dataToUse?.map((crew) => (
            <Link key={crew.id} href={`/crewmember/${crew.id}`}>
              <div
                className="flex items-end justify-between border-b border-zinc-600 p-1 px-2 text-left transition-all duration-200 hover:-translate-y-1 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
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
            </Link>
          ))}
          {dataToUse?.length === 0 &&
            searchTerm.length == 0 &&
            nodeMode === "notOnBlueprint" && (
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: links,
    isLoading,
    isError,
  } = api.schedules.getByName.useQuery({
    name: searchTerm,
  });

  const { mutate, isLoading: isCreating } = api.schedules.create.useMutation({
    onSuccess: (data) => {
      toast.success("Schedule created");
      Copy(data.link);
      setTitle("");
      setDescription("");
    },
    onError: (error) => {
      toast.error("Something went wrong creating the schedule :(");
      console.error(error);
    },
  });

  const Copy = (url: string) => {
    void window.navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const ExportSchedule = useCallback(() => {
    const nodes = GetListOfNodesSortedByColumn();

    const schedule = {
      title: title,
      notes: description,
      nodes: JSON.stringify(nodes),
    };

    mutate(schedule);
  }, [title, description, mutate]);

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh]">
      <div className="flex items-center justify-between border-b border-zinc-600 p-1 ">
        <h1 className="w-full text-center font-bold sm:text-lg ">
          Export Schedule
        </h1>
      </div>

      <div className="flex flex-col gap-1 pr-1">
        <div className="p-2" />
        <p className="text-lg font-semibold">Title</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded bg-zinc-100 p-2 text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none disabled:text-black"
          disabled={isCreating}
        />
        <p className="text-lg font-semibold">Notes</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes about the schedule (optional)"
          className="rounded bg-zinc-100 p-2 text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none disabled:text-black"
          disabled={isCreating}
        />
        <button
          onClick={ExportSchedule}
          disabled={isCreating}
          className="flex items-center justify-center gap-1 rounded bg-gradient-to-br from-amber-700 to-red-700 p-2 font-semibold text-white hover:from-amber-600 hover:to-red-600 disabled:bg-red-500"
        >
          {isCreating ? (
            <LoadingSpinner />
          ) : (
            <>
              <p>Create Link</p>
              <RocketLaunchIcon className="h-5 w-5" />
            </>
          )}
        </button>
        <div className="flex flex-col py-3 text-center text-lg font-semibold">
          Schedule History
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className="rounded bg-zinc-100 p-1 font-normal text-zinc-600 outline-none placeholder:font-normal placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 active:outline-none disabled:text-black"
            disabled={isCreating}
          />
        </div>
        <div className="border-t border-zinc-600">
          {isLoading && (
            <div className="flex items-center justify-center  py-5">
              <LoadingSpinner />
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center  py-5">
              <p>Something went wrong</p>
            </div>
          )}
          {links?.map((data) => (
            <button
              onClick={() => Copy(data.link)}
              key={data.id}
              className="flex w-full items-center justify-between border-b border-zinc-600 transition-all duration-200 hover:rounded-sm hover:bg-zinc-600 sm:py-2  "
            >
              <div className="flex w-8/12 items-center">
                {data && data.user && data.user.profilePicture && (
                  <Image
                    className="scale-75 rounded-full sm:scale-90"
                    src={data.user.profilePicture}
                    width={50}
                    height={50}
                    alt={`${data.user.email || "unknown"} + 's profile picture`}
                  />
                )}
                <div className="flex w-5/6 flex-col items-start justify-center pl-1 sm:w-2/3 ">
                  {data.user?.profilePicture === null && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-400">
                      <p className="font-semibold text-white">
                        {data.user?.email?.charAt(0).toUpperCase()}
                      </p>
                    </div>
                  )}
                  <p className="font-semibold w-full truncate text-left text-lg tracking-tight">
                    {data.title}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {data.user?.email || "unknown"}
                  </p>
                </div>
              </div>
              <p className="hidden italic text-zinc-300 sm:flex sm:w-1/2">
                {data.description}
              </p>

              <Link
                href={data.link}
                className="rounded bg-zinc-600 p-2 hover:scale-105 hover:bg-zinc-500"
              >
                <ArrowUpRightIcon className="h-5 w-5 text-white" />
              </Link>
            </button>
          ))}
          {links?.length === 0 && searchTerm === "" && (
            <div className="flex flex-col items-center justify-center gap-5 py-5">
              <p className="text-center text-zinc-400">
                No schedules have been created yet
              </p>
            </div>
          )}
          {links?.length === 0 && searchTerm.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-5 py-5">
              <p className="text-center text-zinc-400">
                Nothing found for &quot;{searchTerm}&quot;
              </p>
            </div>
          )}
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

export const Stats = (props: {
  blueprint: Blueprint;
  currentNodes: Node[];
}) => {
  const data = JSON.parse(props.blueprint?.data) as IFlowInstance;

  const currentNodes = props.currentNodes;

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

  const findDuplicateCrewNodes = (nodes: Node[]) => {
    const crewNodes = nodes.filter((node) => node.type === "crewNode");
    const crewNames = crewNodes.map((node) => node.data as CrewMember);

    const duplicateCrewNames = crewNames.filter((name) =>
      crewNames.find((n) => n.id === name.id)
    );

    const duplicateCrewNodes: CrewMember[] = [];

    crewNames.filter((node) => {
      const res =
        duplicateCrewNames.includes(node) &&
        !duplicateCrewNodes.find((n) => n.id === node.id);

      if (res) duplicateCrewNodes.push(node);
    });
    return duplicateCrewNodes;
  };

  const findDuplicateProjectNodes = (nodes: Node[]) => {
    const projectNodes = nodes.filter((node) => node.type === "projectNode");
    const projectNames = projectNodes.map((node) => node.data as Project);

    const duplicateProjectNames = projectNames.filter((name) =>
      projectNames.find((n) => n.id === name.id)
    );

    const duplicateProjectNodes: Project[] = [];

    projectNames.filter((node) => {
      const res =
        duplicateProjectNames.includes(node) &&
        !duplicateProjectNodes.find((n) => n.id === node.id);

      if (res) duplicateProjectNodes.push(node);
    });
    return duplicateProjectNodes;
  };

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <div className="flex items-center justify-between border-b border-zinc-600 p-1 ">
        <h1 className="w-full text-center font-bold sm:text-lg ">
          Blueprint Stats
        </h1>
      </div>

      <div className="flex flex-col gap-1 p-1">
        <div className="pb-4">
          <div className="flex gap-2">
            <p className="font-semibold">Crew Count:</p>
            <p> {crewCount} </p>
          </div>

          <div className="py-2">
            <p className="font-semibold">Duplicate Crew Members</p>

            {findDuplicateCrewNodes(currentNodes).length > 0 ? (
              <div className="border-t border-zinc-600">
                {findDuplicateCrewNodes(data.nodes).map((node) => (
                  <p className="border-b border-zinc-600 p-1" key={node.id}>
                    {node.name}{" "}
                  </p>
                ))}
              </div>
            ) : (
              <span>None</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <p className="font-semibold">Project Count:</p>
          <p> {projectCount} </p>
        </div>
        <div className="py-2">
          <p className="font-semibold">Duplicate Projects</p>
          {findDuplicateProjectNodes(currentNodes).length > 0 ? (
            <div className="border-t border-zinc-600">
              {findDuplicateProjectNodes(data.nodes).map((node) => (
                <p className="border-b border-zinc-600 p-1" key={node.id}>
                  {node.name}
                </p>
              ))}
            </div>
          ) : (
            <span>None</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const More = () => {

  GetListOfNodesSortedByColumn();

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <h1 className="w-full text-center font-bold sm:text-lg">More</h1>

      <div className="flex justify-center gap-1 p-1">
        <div className="flex h-32 items-center justify-center p-5">
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};
