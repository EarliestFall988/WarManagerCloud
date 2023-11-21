import {
  ArrowDownTrayIcon,
  ArrowLongUpIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { type Sector, type Tag } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
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
        <div className="w-full overflow-y-auto overflow-x-hidden ">
          <div
            ref={animateParent}
            className="flex w-full flex-col gap-1 border-t border-zinc-700 p-2 text-gray-100 "
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
                  <div className="h-20"></div>
                  <button
                    onClick={scrollToTop}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <p>Back To Top</p>
                    <ArrowLongUpIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
                  </button>
                  <div className="h-20" />
                </>
              ))}
            {data?.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-center text-2xl font-bold text-zinc-300">
                  {`You don't have any projects with the name '${projectSearchTerm}' yet. `}
                </p>
                <Link
                  href="/newproject"
                  className="m-auto w-64 rounded bg-zinc-700 p-2 text-center font-bold text-zinc-300 transition-all duration-100 hover:scale-105 hover:cursor-pointer hover:bg-zinc-600"
                >
                  Create one now.
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-44" />
    </main>
  );
};

export default ProjectsPage;
