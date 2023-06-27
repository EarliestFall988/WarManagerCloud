import React, { type ReactNode, useCallback, useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import type { Blueprint, CrewMember, Project, Tag } from "@prisma/client";
import type { Edge, Node } from "reactflow";
import {
  ArrowUpRightIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QueueListIcon,
  RocketLaunchIcon,
  SparklesIcon,
  TrashIcon,
  UserIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import useScript from "./dragDropTouchEventsHandling";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { GetListOfNodesSortedByColumn } from "~/states/state";
import TooltipComponent from "./Tooltip";
import * as Tabs from "@radix-ui/react-tabs";
import { TagBubble } from "./TagComponent";

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

  console.log(projectNodes);

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
            <TooltipComponent content="Add Project" side={"top"}>
              <PlusIcon className="h-5 w-5" />
            </TooltipComponent>
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
          <TooltipComponent content="View All Projects" side={"top"}>
            <button
              onClick={() => setNodeMode("all")}
              className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${nodeMode === "all" ? "bg-zinc-600" : ""
                }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </TooltipComponent>
          <TooltipComponent
            content="View Projects NOT on the blueprint"
            side={"top"}
          >
            <button
              onClick={() => setNodeMode("notOnBlueprint")}
              className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-orange-500 ${nodeMode === "notOnBlueprint" ? "bg-orange-600" : ""
                }`}
            >
              <QueueListIcon className="h-5 w-5" />
            </button>
          </TooltipComponent>
          <TooltipComponent
            content="View Projects ONLY on the blueprint"
            side={"top"}
          >
            <button
              onClick={() => setNodeMode("onlyOnBlueprint")}
              className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-blue-500 ${nodeMode === "onlyOnBlueprint" ? "bg-blue-600" : ""
                }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </TooltipComponent>
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
  data: (CrewMember & { tags: Tag[] })[] | undefined;
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
    <div className="mr-1 flex h-[60vh] w-full flex-col gap-3 border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <div className="h-[10vh] w-full">
        <div className="flex items-center justify-between border-b border-zinc-600 p-1 ">
          <div className="flex gap-1">
            <Link
              href="/newCrewMember"
              className="rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
            >
              <TooltipComponent content="Add Crew Member" side={"top"}>
                <PlusIcon className="h-5 w-5" />
              </TooltipComponent>
            </Link>
          </div>
          <div className="flex w-full items-center justify-center gap-1 px-2 text-center text-xs font-bold sm:text-lg">
            <p>
              {nodeMode === "all" && <span>All</span>}
              {" Crew Members"}
              {nodeMode === "notOnBlueprint" && (
                <>
                  {" "}
                  <span className="text-orange-500"> Not</span> on Blueprint
                </>
              )}
              {nodeMode === "onlyOnBlueprint" && (
                <>
                  <span className="text-blue-500"> Only</span> on Blueprint
                </>
              )}
            </p>
          </div>
          <div className="flex gap-1">
            <TooltipComponent content="View All Crew Members" side={"top"}>
              <button
                onClick={() => setNodeMode("all")}
                className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-zinc-500 ${nodeMode === "all" ? "bg-zinc-600" : ""
                  }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
            </TooltipComponent>
            <TooltipComponent
              content="View Crew Members NOT on the blueprints"
              side={"top"}
            >
              <button
                onClick={() => setNodeMode("notOnBlueprint")}
                className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-orange-500 ${nodeMode === "notOnBlueprint" ? "bg-orange-600" : ""
                  }`}
              >
                <QueueListIcon className="h-5 w-5" />
              </button>
            </TooltipComponent>
            <TooltipComponent
              content="View Crew Members ONLY on the blueprint"
              side={"top"}
            >
              <button
                onClick={() => setNodeMode("onlyOnBlueprint")}
                className={`rounded p-1 transition-all duration-100 hover:scale-105 hover:bg-blue-500 ${nodeMode === "onlyOnBlueprint" ? "bg-blue-600" : ""
                  }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </TooltipComponent>
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
      </div>
      <div className="h-[50vh] overflow-y-auto overflow-x-hidden lg:h-[80vh]">
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
                  className="flex items-center justify-start gap-1 border-b border-zinc-600 p-1 px-2 text-left transition-all duration-200 hover:-translate-y-1 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
                  draggable={draggable}
                  onDragStart={(event) => onDragStart(event, "c-" + crew.id)}
                >
                  <div className="max-w-[50%] truncate  ">
                    <p className="truncate text-sm sm:text-lg">{crew.name}</p>
                    <p className="h-5 truncate text-sm font-normal italic text-zinc-300">
                      {crew.position}
                    </p>
                  </div>
                  <div className="flex h-10 w-1/2 flex-wrap items-start justify-start gap-1 overflow-clip text-xs">
                    {crew.tags.map((tag) => (
                      <TagBubble key={tag.id} tag={tag} />
                    ))}
                  </div>
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

  const context = api.useContext();

  const { mutate, isLoading: isCreating } = api.schedules.create.useMutation({
    onSuccess: (data) => {
      toast.success("Schedule created");
      Copy(data.link);
      setTitle("");
      setDescription("");
      void context.schedules.invalidate();
    },
    onError: (error) => {
      toast.error("Something went wrong creating the schedule");
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
                  <p className="w-full truncate text-left text-lg font-semibold tracking-tight">
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
                target="_blank"
                passHref
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

  const crewCount = currentNodes.filter(
    (node) => node.type === "crewNode"
  ).length;

  const projectCount = currentNodes.filter(
    (node) => node.type === "projectNode"
  ).length;

  const findDuplicateCrewNodes = (nodes: Node[]) => {
    const filteredNodes = nodes.filter((node) => node.type === "crewNode");
    const crewNodes = filteredNodes.map((node) => node.data as CrewMember);

    const duplicateCrewNodes: CrewMember[] = [];

    crewNodes.findIndex((node, index) => {
      crewNodes.findLastIndex((n, index2) => {
        if (node.id === n.id && index != index2) {
          if (duplicateCrewNodes.find((n) => n.id === node.id)) return false;

          duplicateCrewNodes.push(node);
          return true;
        }
      });
    });

    return duplicateCrewNodes;
  };

  const findDuplicateProjectNodes = (nodes: Node[]) => {
    const filteredNodes = nodes.filter((node) => node.type === "projectNode");
    const projectNodes = filteredNodes.map((node) => node.data as Project);

    const duplicateProjectNodes: Project[] = [];

    projectNodes.findIndex((node, index) => {
      projectNodes.findLastIndex((n, index2) => {
        if (node.id === n.id && index != index2) {
          if (duplicateProjectNodes.find((n) => n.id === node.id)) return false;

          duplicateProjectNodes.push(node);
          return true;
        }
      });
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
          <div className="flex gap-3">
            <TooltipComponent
              content="The project count on the blueprint"
              side={"top"}
            >
              <div className="flex gap-1 rounded bg-zinc-600 px-2">
                <WrenchScrewdriverIcon className="h-6 w-6" />
                <p>{projectCount}</p>
              </div>
            </TooltipComponent>

            <TooltipComponent
              content="The crew count on the blueprint"
              side={"top"}
            >
              <div className="flex gap-1 rounded bg-zinc-600 px-2">
                <UserIcon className="h-6 w-6" />
                <p> {crewCount} </p>
              </div>
            </TooltipComponent>
          </div>
          <div className="py-2">
            <p className="text-center text-lg font-semibold">
              Duplicate Crew Members
            </p>

            {findDuplicateCrewNodes(currentNodes).length > 0 ? (
              <div className="border-t border-zinc-600">
                {findDuplicateCrewNodes(currentNodes).map((node) => (
                  <p className="border-b border-zinc-600 p-1" key={node.id}>
                    {node.name}{" "}
                  </p>
                ))}
              </div>
            ) : (
              <span className="text-center italic text-zinc-500">
                No Duplicates
              </span>
            )}
          </div>
        </div>
        {/* <div className="flex gap-2">
          <p className="font-semibold">Project Count:</p>
          <p> {projectCount} </p>
        </div> */}
        <div className="py-2">
          <p className="text-center text-lg font-semibold">
            Duplicate Projects
          </p>
          {findDuplicateProjectNodes(currentNodes).length > 0 ? (
            <div className="border-t border-zinc-600">
              {findDuplicateProjectNodes(data.nodes).map((node) => (
                <p className="border-b border-zinc-600 p-1" key={node.id}>
                  {node.name}
                </p>
              ))}
            </div>
          ) : (
            <span className="text-center italic text-zinc-500">
              No Duplicates
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const TabContent: React.FC<{ value: string; children: ReactNode }> = ({
  value,
  children,
}) => {
  return (
    <Tabs.Content
      className="fade-x h-[60vh] w-full border-t border-zinc-600 sm:m-0 lg:min-h-[30vh]"
      value={value}
    >
      {children}
    </Tabs.Content>
  );
};

export const More: React.FC<{ blueprint: Blueprint }> = ({ blueprint }) => {
  // GetListOfNodesSortedByColumn();

  const [blueprintName, setblueprintName] = useState(blueprint.name);
  const [blueprintDescription, setBlueprintDescription] = useState(
    blueprint.description
  );

  useScript(
    "https://bernardo-castilho.github.io/DragDropTouch/DragDropTouch.js"
  );

  return (
    <div className="mr-1 h-[60vh] w-full border-r border-zinc-600 sm:m-0 lg:h-[90vh] ">
      <div className="flex justify-center gap-1 p-1">
        <Tabs.Root className="w-full" defaultValue="tab1">
          <Tabs.List className="flex justify-around gap-2 pb-1">
            <Tabs.Trigger
              className="flex w-full items-center justify-center gap-2 bg-zinc-600 p-2 font-semibold data-[state=active]:bg-amber-700"
              value="tab1"
            >
              <SparklesIcon className="h-6 w-6" /> More
            </Tabs.Trigger>
            <Tabs.Trigger
              className="flex w-full items-center justify-center gap-2 bg-zinc-600 font-semibold data-[state=active]:bg-amber-700"
              value="tab2"
            >
              <Cog6ToothIcon className="h-6 w-6" /> Settings
            </Tabs.Trigger>
          </Tabs.List>
          <TabContent value="tab1">
            <div
              className="flex select-none items-center justify-start border-b border-zinc-600 text-left transition-all duration-200 hover:-translate-y-1 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
              draggable={false}
              onDragStart={(event) => onDragStart(event, "c-" + "test")}
            >
              <BookmarkIcon className="h-12 w-12 text-yellow-200 " />
              <div className="w-2/3 truncate">
                <p className="truncate text-sm sm:text-lg">Sticky Note</p>
                <p className="truncate text-sm font-normal italic text-zinc-300">
                  {"Make a note of something important"}
                </p>
              </div>
            </div>

            <div
              className="flex select-none items-center justify-start border-b border-zinc-600 text-left transition-all duration-200 hover:-translate-y-1 hover:rounded hover:bg-zinc-600 hover:shadow-lg"
              draggable={false}
              onDragStart={(event) => onDragStart(event, "c-" + "test")}
            >
              <BookmarkIcon className="h-12 w-12 text-yellow-200 " />
              <div className="w-2/3 truncate">
                <p className="truncate text-sm sm:text-lg">Sticky Note</p>
                <p className="truncate text-sm font-normal italic text-zinc-300">
                  {"Make a note of something important"}
                </p>
              </div>
            </div>
          </TabContent>
          <TabContent value="tab2">
            <div className="flex w-1/2 flex-col gap-2 py-4 placeholder:text-zinc-700 placeholder:italic">
              <div>
                <p className="font-semibold">Title</p>
                <input
                  type="text"
                  placeholder="Blueprint Name"
                  value={blueprintName}
                  onChange={(e) => {
                    setblueprintName(e.currentTarget.value);
                  }}
                  className="w-full rounded p-1 text-zinc-700 hover:ring-2 hover:ring-zinc-500 focus:ring-2 focus:ring-amber-600"
                />
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <input
                  type="text"
                  placeholder="Blueprint Description"
                  value={blueprintDescription}
                  onChange={(e) => {
                    setBlueprintDescription(e.currentTarget.value);
                  }}
                  className="w-full rounded p-1 text-zinc-700 outline-none hover:ring-2 hover:ring-zinc-500 focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
            <div className="h-10 w-full border-t border-zinc-600 py-4">
              <div className="w-full">
                <p className="font-semibold">Danger Zone</p>
                <TooltipComponent
                  content="Warning! You will not be able to recover the blueprint after you delete it."
                  side={"left"}
                >
                  <button className="transition-color flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 p-2 font-bold duration-100 hover:bg-red-500">
                    <TrashIcon className="h-5 w-5" />
                    Delete Blueprint Forever
                  </button>
                </TooltipComponent>
              </div>
            </div>
          </TabContent>
        </Tabs.Root>
      </div>
    </div>
  );
};
