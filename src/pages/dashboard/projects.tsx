import {
  ArrowDownTrayIcon,
  ArrowLongUpIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { type Sector, type Tag } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import { type ReactNode, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { TagsPopover } from "~/components/TagDropdown";
import TooltipComponent from "~/components/Tooltip";
import { SimpleDropDown } from "~/components/dropdown";
import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import { DashboardMenu } from "~/components/dashboardMenu";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import Head from "next/head";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ProjectCard } from "~/components/dashboardCards";
import { CouldNotLoadMessageComponent } from "~/components/couldNotLoadMessageComponent";

const ProjectMenu = () => (
  <>
    <Head>
      <title>Projects | War Manager</title>
    </Head>
    <TooltipComponent content="Add a New Project" side="bottom">
      <Link
        href="/projects/new"
        className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
      >
        <PlusIcon className="h-6 w-6 text-zinc-100" />
      </Link>
    </TooltipComponent>
    <TooltipComponent content="Download Projects Spreadsheet" side="bottom">
      <Link
        href="/projects/download"
        className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
      >
        <ArrowDownTrayIcon className="h-6 w-6 text-zinc-100" />
      </Link>
    </TooltipComponent>
    <TooltipComponent content="View Tags" side="bottom">
      <Link
        href="/tags"
        className=" flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
      >
        <TagIcon className="h-6 w-6 text-zinc-100" />
      </Link>
    </TooltipComponent>
  </>
);

const ProjectsPage: NextPage = () => {
  const [animateParent] = useAutoAnimate();

  const [useAutoFilters, setUseAutoFilters] = useState<
    "soon" | "progress" | "support" | ""
  >("");

  const setAutoFilter = useCallback(
    (e: string) => {
      if (useAutoFilters === e) return setUseAutoFilters("");

      setUseAutoFilters(e as "soon" | "progress" | "support" | "");
    },
    [useAutoFilters]
  );

  const [projectSearchTerm, setProjectsSearchTerm] = useState("");

  const [filter, setFilter] = useState<Tag[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filterToStringArray: string[] = filter.map((tag) => {
    return tag.id;
  });

  const filterSectorsToStringArray = sectors.map((sector) => {
    return sector.id;
  });

  const { data, isLoading, isError } = api.projects.search.useQuery({
    search: projectSearchTerm,
    tagsFilter: filterToStringArray,
    sectorsFilter: filterSectorsToStringArray,
    autoFilter: useAutoFilters,
  });

  const { data: comingUpCount } = api.projects.getComingUpCount.useQuery({
    tagsFilter: filterToStringArray,
    sectorsFilter: filterSectorsToStringArray,
  });

  const { data: supportCount } = api.projects.getSupportCount.useQuery({
    tagsFilter: filterToStringArray,
    sectorsFilter: filterSectorsToStringArray,
  });

  const { data: inProgressCount } =
    api.projects.getProjectsInProgressCount.useQuery({
      tagsFilter: filterToStringArray,
      sectorsFilter: filterSectorsToStringArray,
    });

  const ctx = api.useContext();

  const { mutate } = api.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project Deleted");
      void ctx.projects.invalidate();
    },
  });

  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/projects" />;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="flex min-h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="w-full">
        <div className="w-full">
          <div className="flex w-full items-center justify-between gap-1 p-2">
            <div className="flex w-full gap-1">
              <input
                type="search"
                value={projectSearchTerm}
                onChange={(e) => setProjectsSearchTerm(e.target.value)}
                placeholder="search projects by name, job code, or address"
                className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
              />
              {/* <TooltipComponent content="Filter Tags" side="bottom"> */}
              <TagsPopover
                savedTags={filter}
                savedSectors={sectors}
                type={"projects and sectors"}
                onSetTags={setFilter}
                onSetSectors={setSectors}
              >
                <button
                  onClick={() => {
                    setFilterOpen(!filterOpen);
                  }}
                  className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
                >
                  <FunnelIcon className="h-6 w-6 text-zinc-100" />
                </button>
              </TagsPopover>
              {/* </TooltipComponent> */}
            </div>
            <div className="hidden gap-1 md:flex">
              <ProjectMenu />
            </div>
            <SimpleDropDown
              trigger={
                <div className="flex items-center justify-center p-2 md:hidden">
                  <EllipsisVerticalIcon className="h-6 w-6 text-zinc-100" />
                </div>
              }
            >
              <div className="flex gap-1">
                <ProjectMenu />
              </div>
            </SimpleDropDown>
          </div>
        </div>
        <div className="w-full overflow-y-auto overflow-x-hidden px-1">
          <div className="flex items-center gap-2 overflow-x-auto border-t border-zinc-700 p-1 sm:justify-start md:text-lg">
            <SelectionTagsWithChips
              setKeyword={setAutoFilter}
              description="Projects that have not started yet, but might be starting soon."
              keyword="soon"
              selectedWord={useAutoFilters}
              amt={comingUpCount || 0}
            >
              <p className="whitespace-nowrap">{"Coming Up"}</p>
            </SelectionTagsWithChips>
            <SelectionTagsWithChips
              setKeyword={setAutoFilter}
              description="Projects that have teams actively working on them."
              keyword="progress"
              selectedWord={useAutoFilters}
              amt={inProgressCount || 0}
            >
              <p className="whitespace-nowrap">{"In Progress"}</p>
            </SelectionTagsWithChips>
            <SelectionTagsWithChips
              setKeyword={setAutoFilter}
              description="Projects that are struggling and might need your help."
              keyword="support"
              selectedWord={useAutoFilters}
              amt={supportCount || 0}
            >
              <p className="whitespace-nowrap">{"Need Support"}</p>
            </SelectionTagsWithChips>
          </div>
          <div
            ref={animateParent}
            className="flex h-[80] w-full flex-col gap-1 overflow-y-auto overflow-x-hidden p-1 text-gray-100 lg:h-[85vh]"
          >
            {(isLoading && (
              // <LoadingHeader loading={isLoading} title={"Loading Projects"} />
              <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-2">
                <LoadingSpinner />
                <p className="font-semibold text-zinc-600">Loading Projects</p>
              </div>
            )) ||
              (isError && (
                <CouldNotLoadMessageComponent pluralName="projects" />
              )) ||
              (data && data?.length > 0 && (
                <>
                  {data?.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      tags={project.tags}
                      sectors={project.sectors}
                      index={index}
                      deleteProject={(e) => {
                        mutate({ id: e });
                      }}
                    />
                  ))}
                  <div className="flex h-20 items-center justify-center pb-32 pt-16">
                    <button
                      onClick={scrollToTop}
                      className="flex items-center justify-center gap-2"
                    >
                      <p>Back To Top</p>
                      <ArrowLongUpIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
                    </button>
                  </div>
                </>
              ))}
            {data?.length === 0 && (
              <div className="flex h-[30vh] items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-7">
                  {projectSearchTerm.length > 0 && (
                    <p className="text-center text-2xl font-semibold text-zinc-300">
                      {`You don't have any projects with the name '${projectSearchTerm}' yet`}
                    </p>
                  )}
                  {projectSearchTerm.length <= 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-center text-2xl font-semibold text-zinc-300">
                        {`No Project Found`}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/projects/new"
                    className="flex w-64 items-center justify-center gap-2 rounded bg-amber-800 p-2 text-center font-semibold text-zinc-300 transition duration-200 hover:scale-105 hover:cursor-pointer hover:bg-amber-700"
                  >
                    <PlusIcon className="h-6 w-6 text-zinc-100" />
                    {projectSearchTerm.length > 0 && <p>Create it now</p>}
                    {projectSearchTerm.length <= 0 && (
                      <p>Create A New Project</p>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-44" />
    </main>
  );
};

const SelectionTagsWithChips: React.FC<{
  children: ReactNode;
  keyword: string;
  selectedWord: string;
  amt: number;
  description: string;
  setKeyword: (e: string) => void;
}> = ({ children, amt, selectedWord, keyword, setKeyword, description }) => {
  const selected = selectedWord === keyword;

  return (
    <TooltipComponent
      content={
        selected ? description + " (click to remove filter)" : description
      }
      side="bottom"
    >
      <button
        onClick={() => {
          setKeyword(keyword);
        }}
        className={`relative flex select-none items-center gap-2 rounded  ${
          selected
            ? "border-2 border-amber-600 hover:bg-red-800"
            : "border-2 border-transparent hover:bg-zinc-600 focus:bg-zinc-600"
        } bg-zinc-700 p-2 font-semibold outline-none transition duration-200 `}
      >
        {amt > 0 && (
          <div className="absolute right-0 top-0 flex h-5 w-5 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-amber-700 shadow-md">
            <p className="text-center text-sm">{amt}</p>
          </div>
        )}
        {selected && <XMarkIcon className="h-5 w-5" />}
        {children}
      </button>
    </TooltipComponent>
  );
};

export default ProjectsPage;
