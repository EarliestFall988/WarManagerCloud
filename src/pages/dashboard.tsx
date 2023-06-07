import type { NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Head from "next/head";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowsUpDownIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  SparklesIcon,
  TrashIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";

import { toast } from "react-hot-toast";
import TooltipComponent from "~/components/Tooltip";
import Image from "next/image";
import { ReactECharts } from "~/components/charts/React-Echarts";
import GaugeOption from "~/components/charts/GaugeChartDataTest";
import PieChartOption from "~/components/charts/PieChartDataTest";
import BarChartOption from "~/components/charts/BarChartDataTest";
import CalendarHeatMapOption from "~/components/charts/CalendarHeatMapDataTest";
import {
  ProjectPerformanceRatingCustomer,
  ProjectPerformanceRatingQuality,
  ProjectPerformanceRatingSafety,
  ProjectPerformanceRatingStaffing,
} from "~/components/charts/PerformanceDataPieChart";
import SunBurstTestOption from "~/components/charts/SunburstDataTest";
import { ReactEChartsLarge } from "~/components/charts/React-EchartsLarge";

dayjs.extend(relativeTime);

const BlueprintsList = () => {
  const [blueprintSearchTerm, setBlueprintSearchTerm] = useState("");

  const {
    data,
    isLoading: loadingBlueprints,
    isError: loadingBlueprintsError,
  } = api.blueprints.search.useQuery({
    search: blueprintSearchTerm,
  });

  // const data = props.data;

  // if (loadingBlueprints)
  //   return (
  //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
  //       <LoadingSpinner />
  //     </div>
  //   );

  // if (loadingBlueprintsError || !data)
  //   return (
  //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
  //       <p className="text-lg italic text-red-500">Could not load blueprints</p>
  //     </div>
  //   );

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-1 sm:w-[74vw] ">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Blueprints
        </h2>
        <input
          type="search"
          value={blueprintSearchTerm}
          onChange={(e) => setBlueprintSearchTerm(e.target.value)}
          placeholder="search blueprints"
          className="w-3/5 rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700"
        />
        <TooltipComponent content="Create a New Blueprint" side="left">
          <Link
            href="/newblueprint"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold"
          >
            <p>+</p>
          </Link>
        </TooltipComponent>
      </div>

      {loadingBlueprints ? (
        <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
          <LoadingSpinner />
        </div>
      ) : loadingBlueprintsError || !data ? (
        <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
          <p className="text-lg italic text-red-500">
            Could not load blueprints
          </p>
        </div>
      ) : (
        data.length > 0 && (
          <div className="flex h-[85vh] justify-center overflow-y-auto">
            <div className="flex w-full flex-col gap-1 p-2 text-gray-100 sm:w-11/12 md:w-3/4">
              {data?.map((blueprint) => (
                <Link
                  href={`/blueprints/${blueprint.id}`}
                  passHref
                  className="flex w-full items-center justify-between gap-1 rounded-sm bg-zinc-700 p-1 py-2 shadow-sm transition-all duration-100 hover:bg-zinc-600"
                  key={blueprint.id}
                >
                  <DocumentIcon className="h-6 w-6 text-zinc-300" />
                  <h2 className="w-3/2 truncate text-left text-lg font-semibold tracking-tight sm:w-1/4">
                    {blueprint.name}
                  </h2>
                  <div className="hidden font-thin sm:flex sm:w-1/2 ">
                    <p className="w-full truncate text-ellipsis text-center">
                      {blueprint.description}
                    </p>
                  </div>
                  <p className="w-1/4 truncate text-right text-sm italic">
                    {dayjs(blueprint.updatedAt).fromNow()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
      {data?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-xl font-bold text-zinc-300">
            No Blueprints matching your search {`'${blueprintSearchTerm}'`}
          </p>
        </div>
      )}
    </>
  );
};

const CrewMembers = () => {
  const [crewSearchTerm, setCrewSearchTerm] = useState("");

  const {
    data: crewData,
    isLoading,
    isError: loadingCrewError,
  } = api.crewMembers.search.useQuery({
    search: crewSearchTerm,
  });

  const ctx = api.useContext();

  const { mutate } = api.crewMembers.delete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} Successfully Deleted`);
      void ctx.crewMembers.invalidate();
    },
    onError: (err) => {
      toast.error(`Could not delete Crew Member`);
      console.log(err);
    },
  });

  const copy = useCallback((text: string, type: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${type}Copied to clipboard`);
  }, []);

  const removeCrewMember = useCallback(
    (id: string) => {
      toast.loading("Deleting Crew Member", { duration: 2000 });
      mutate({ crewMemberId: id });
    },
    [mutate]
  );

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Crew Members
        </h2>
        <input
          type="search"
          value={crewSearchTerm}
          onChange={(e) => setCrewSearchTerm(e.target.value)}
          placeholder="search crew members by name, or position"
          className="w-3/5 rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700"
        />
        <TooltipComponent content="Add a New Crew Member" side="left">
          <Link
            href="/newCrewMember"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold"
          >
            <p>+</p>
          </Link>
        </TooltipComponent>
      </div>
      <div className="flex justify-center overflow-y-auto">
        {isLoading ? (
          <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
            <LoadingSpinner />
          </div>
        ) : loadingCrewError || !crewData ? (
          <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
            <p className="text-lg italic text-red-500">could not load data</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-1 p-2 text-gray-100 sm:w-11/12 md:w-3/4">
            {crewData.length > 0 &&
              crewData?.map((crewMember) => (
                <div
                  className="flex rounded-sm bg-zinc-700 hover:bg-zinc-600"
                  key={crewMember.id}
                >
                  <Link
                    href={`/crewmember/${crewMember.id}`}
                    passHref
                    className="flex w-full items-center gap-1 rounded-sm p-1 shadow-sm transition-all duration-100  sm:justify-between"
                  >
                    <UserCircleIcon className="h-10 w-10 text-zinc-300" />
                    <div className="w-3/2 flex flex-col items-start text-left text-white sm:w-1/3">
                      <p className="text-sm tracking-tight text-zinc-400">
                        {crewMember.position}
                      </p>
                      <div className="flex items-center justify-start gap-1">
                        <p className="truncate text-lg font-semibold text-white ">
                          {crewMember.name}
                        </p>
                        {crewMember.description
                          .toLowerCase()
                          .includes("travel") &&
                          !crewMember.description
                            .toLowerCase()
                            .includes("not") &&
                          !crewMember.description
                            .toLowerCase()
                            .includes("n't") && (
                            <PaperAirplaneIcon className="h-4 w-4 -rotate-45 text-zinc-200" />
                          )}
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <p className="text-sm tracking-tight">
                          {crewMember.phone}
                        </p>
                        {crewMember.email && (
                          <p className="text-sm tracking-tight">|</p>
                        )}
                        <p className="text-sm tracking-tight">
                          {crewMember.email}
                        </p>
                      </div>
                    </div>
                    <div className="hidden px-1 tracking-tight sm:flex sm:w-1/2 ">
                      <p className="h-full w-full truncate text-left italic text-zinc-300">
                        {crewMember.description}
                      </p>
                    </div>
                    <div className="hidden w-1/6 truncate text-right text-sm italic sm:flex">
                      <p className="w-full text-right">
                        <span className="text-zinc-400">updated</span>{" "}
                        {dayjs(crewMember.updatedAt).fromNow()}
                      </p>
                    </div>
                  </Link>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="rounded-sm bg-transparent p-1 transition-all duration-100">
                        <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="w-44 rounded-lg border border-zinc-600 bg-zinc-900/30 p-3 py-2 drop-shadow-lg backdrop-blur ">
                        <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-600" />
                        <DropdownMenu.Item
                          className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-500/50"
                          onClick={(e) => {
                            e.preventDefault();
                            copy(crewMember.email, "Email");
                          }}
                        >
                          <ClipboardDocumentIcon className="h-5 w-5 text-zinc-200 " />
                          Copy Email
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-500/50"
                          onSelect={(e) => {
                            e.preventDefault();
                            copy(crewMember.phone, "Phone");
                          }}
                        >
                          <PhoneIcon className="h-5 w-5 text-zinc-200 " />
                          Copy Phone
                        </DropdownMenu.Item>
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                              <TrashIcon className="h-4 w-4 text-white" />
                              Delete
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur" />
                            <div className="flex h-screen w-screen items-center justify-center">
                              <Dialog.Content className="fixed top-[50%] m-auto rounded-lg bg-black p-3 py-2 drop-shadow-lg backdrop-blur">
                                <Dialog.Title className="text-lg font-bold text-white">
                                  Delete Crew Member
                                </Dialog.Title>
                                <Dialog.Description className="text-white">
                                  Are you sure you want to delete this crew
                                  member? This action cannot be undone.
                                </Dialog.Description>
                                <div className="mt-4 flex justify-end gap-2">
                                  <Dialog.Close asChild>
                                    <button className="rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-red-600">
                                      Cancel
                                    </button>
                                  </Dialog.Close>
                                  <Dialog.Close asChild>
                                    <button
                                      className="rounded bg-gradient-to-br from-red-700 to-amber-700 p-2 text-center transition-all duration-100 hover:bg-red-600"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        removeCrewMember(crewMember.id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </Dialog.Close>
                                </div>
                              </Dialog.Content>
                            </div>
                          </Dialog.Portal>
                        </Dialog.Root>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              ))}
            {crewData.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-xl font-bold text-zinc-300">
                  No Crew Members matching your search {`'${crewSearchTerm}'`}
                </p>
                <Link
                  href="/newCrewMember"
                  className="m-auto w-64 rounded bg-zinc-700 p-2 text-center font-bold text-zinc-300 transition-all duration-100 hover:scale-105 hover:cursor-pointer hover:bg-zinc-600"
                >
                  Create one now.
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const Projects = () => {
  const [projectSearchTerm, setProjectsSearchTerm] = useState("");

  const { data, isLoading, isError } = api.projects.search.useQuery({
    search: projectSearchTerm,
  });

  const ctx = api.useContext();

  const { mutate } = api.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project Deleted");
      void ctx.projects.invalidate();
    },
  });

  const copyAddress = useCallback((address: string) => {
    void window.navigator.clipboard.writeText(address);
    toast.success("Address Copied to Clipboard");
  }, []);

  const deleteJob = useCallback(
    (id: string) => {
      toast.loading("Deleting Project", { duration: 2000 });
      mutate({ id });
    },
    [mutate]
  );

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Projects
        </h2>
        <input
          type="search"
          value={projectSearchTerm}
          onChange={(e) => setProjectsSearchTerm(e.target.value)}
          placeholder="search projects by name, job code, or address"
          className="w-3/5 rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700"
        />
        <TooltipComponent content="Add a New Project" side="left">
          <Link
            href="/newproject"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold"
          >
            <p>+</p>
          </Link>
        </TooltipComponent>
      </div>

      {(isLoading && (
        <div className="flex flex-col items-center justify-center gap-2">
          <LoadingSpinner />
          <p className="text-xl font-bold text-zinc-300">Loading Projects</p>
        </div>
      )) ||
        (isError && (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-xl font-bold text-zinc-300">
              Error Loading Projects
            </p>
          </div>
        )) ||
        (data && data?.length > 0 && (
          <div className="flex justify-center">
            <div className="flex w-full flex-col gap-1 p-2 text-gray-100 sm:w-11/12 md:w-3/4">
              {data?.map((project) => (
                <div
                  className="flex w-full items-center gap-1 rounded-sm bg-zinc-700 pl-1 hover:bg-zinc-600"
                  key={project.id}
                >
                  <WrenchScrewdriverIcon className="h-8 w-8 text-zinc-300" />
                  <Link
                    href={`/projects/${project.id}`}
                    passHref
                    className="flex w-full items-center gap-1 overflow-hidden rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between"
                  >
                    <div className="w-3/4 sm:w-1/2">
                      <div className="flex w-full items-center justify-start gap-1 overflow-clip">
                        <p className="whitespace-nowrap text-sm font-normal text-zinc-300">
                          {project.jobNumber}
                        </p>
                        <p className="truncate text-ellipsis ">
                          {project.name}
                        </p>
                      </div>
                      <div className="flex w-full items-center justify-start gap-1 overflow-clip text-zinc-300">
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />
                        <p className="w-36 truncate rounded text-left text-sm italic ">
                          {project.status}
                        </p>
                        <div className="flex w-full items-center justify-start gap-1 overflow-clip">
                          <MapPinIcon className="h-4 w-4" />
                          <p className="block w-28 truncate text-left text-sm font-normal italic tracking-tight">
                            {project.city}
                          </p>
                          <p className="block w-full truncate text-left text-sm font-normal italic tracking-tight">
                            {project.state}
                          </p>
                        </div>
                      </div>
                      {/* <div className="flex gap-1">
                    <p className="truncate rounded-md text-amber-200 bg-zinc-600 px-1 text-center text-sm tracking-wide">
                      Kansas City
                    </p>
                    <p className="truncate rounded-md text-amber-200 bg-zinc-600 px-1 text-center text-sm tracking-wide">
                      Commercial Roofing
                    </p>
                  </div> */}
                    </div>
                    <div className="hidden overflow-clip font-thin sm:flex sm:w-1/2">
                      <p className="w-full truncate text-ellipsis text-center">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex w-1/6 items-center justify-end gap-1 overflow-clip px-1">
                      <p className="hidden text-xs text-zinc-400 md:block">
                        updated
                      </p>
                      <p className="hidden truncate text-right text-sm italic sm:block">
                        {dayjs(project.updatedAt).fromNow()}
                      </p>
                    </div>
                  </Link>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-1">
                        <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content className="w-44 rounded-lg border border-zinc-600 bg-zinc-900/30 p-3 py-2 drop-shadow-lg backdrop-blur ">
                        <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-600" />
                        <DropdownMenu.Item
                          className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-500/50"
                          onSelect={() => {
                            copyAddress(
                              project.address +
                                " " +
                                project.city +
                                " " +
                                project.state +
                                " " +
                                project.zip
                            );
                          }}
                        >
                          <ClipboardDocumentIcon className="h-5 w-5 text-zinc-200 " />
                          Copy Address
                        </DropdownMenu.Item>
                        <Dialog.Root>
                          <Dialog.Trigger asChild>
                            <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                              <TrashIcon className="h-5 w-5 text-white" />
                              Delete
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur" />
                            <div className="flex h-screen w-screen items-center justify-center">
                              <Dialog.Content className="fixed top-[50%] m-auto rounded-lg bg-black p-3 py-2 drop-shadow-lg backdrop-blur">
                                <Dialog.Title className="text-lg font-bold text-white">
                                  Delete Project
                                </Dialog.Title>
                                <Dialog.Description className="text-white">
                                  Are you sure you want to delete this project?
                                  This action cannot be undone.
                                </Dialog.Description>
                                <div className="mt-4 flex justify-end gap-2">
                                  <Dialog.Close asChild>
                                    <button className="rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-red-600">
                                      Cancel
                                    </button>
                                  </Dialog.Close>
                                  <Dialog.Close asChild>
                                    <button
                                      className="rounded bg-gradient-to-br from-red-700 to-amber-700 p-2 text-center transition-all duration-100 hover:bg-red-600"
                                      onClick={() => {
                                        deleteJob(project.id);
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </Dialog.Close>
                                </div>
                              </Dialog.Content>
                            </div>
                          </Dialog.Portal>
                        </Dialog.Root>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              ))}
            </div>
          </div>
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
    </>
  );
};

const Loader = () => {
  return (
    <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-4 bg-zinc-700/20 sm:w-[80vw]">
      <LoadingSpinner />
    </div>
  );
};

type PieChartCardProps = {
  title: string;
  chart: ReactNode;
};

const PieChartCard: FC<PieChartCardProps> = ({ title, chart }) => {
  const [open, setOpen] = useState(true);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
   <>
      <div
        className={`${
          open ? "h-72 w-1/4" : "h-14 w-1/4"
        } overflow-hidden rounded bg-zinc-700 transition-all duration-200 `}
      >
        <div className="flex items-start justify-between p-2">
          <h3 className="text-zinc-400">{title}</h3>
          <button
            onClick={() => toggleOpen()}
            className="rounded bg-zinc-600 p-2 shadow transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
          >
            <ArrowsUpDownIcon className="h-6 w-6 text-zinc-300" />
          </button>
        </div>
        {open && <div>{chart}</div>}
      </div>
    </>
  );
};

const DashboardAtAGlance = () => {
  const loading = false;

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
        {/* <h2 className="p-2 text-center text-2xl font-bold text-gray-100">
          At a Glance
        </h2> */}
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="h-auto items-end overflow-x-clip p-5 md:h-[90vh] md:overflow-y-auto">
          {/* <ReactECharts option={GaugeOption} /> */}
          {/* <ReactECharts option={CalendarHeatMapOption} /> */}
          {/* <ReactECharts option={PieChartOption} /> */}
          <div className="my-1 h-80 rounded bg-zinc-200 shadow-lg md:w-3/6">
            <h3 className="py-2 text-center text-lg font-semibold text-zinc-900">
              All Jobs
            </h3>
            <ReactECharts option={BarChartOption} width="w-full" />
          </div>
          {/* <ReactECharts option={GaugeOption} /> */}
          <div className="mx-auto flex w-full flex-col justify-start gap-1 md:flex-row">
            <div className="mx-auto flex items-center justify-center rounded py-5 font-bold text-zinc-100 md:m-0 md:bg-zinc-700 md:py-0 md:text-sm">
              <p className="whitespace-nowrap md:-rotate-90">Overall Ratings</p>
            </div>
            <div className="flex h-full w-full flex-wrap items-start justify-start gap-1">
              <PieChartCard
                title="Safety"
                chart={
                  <ReactECharts
                    option={ProjectPerformanceRatingSafety}
                    width="full"
                  />
                }
              />
              <PieChartCard
                title="Customer"
                chart={
                  <ReactECharts
                    option={ProjectPerformanceRatingCustomer}
                    width="full"
                  />
                }
              />
              <PieChartCard
                title="Performance"
                chart={
                  <ReactECharts
                    option={ProjectPerformanceRatingQuality}
                    width="full"
                  />
                }
              />
              <PieChartCard
                title="Staffing"
                chart={
                  <ReactECharts
                    option={ProjectPerformanceRatingStaffing}
                    width="full"
                  />
                }
              />
            </div>
          </div>
          <div className="h-full m-5 rounded">
            <ReactEChartsLarge option={SunBurstTestOption} />
          </div>
        </div>
      )}
    </>
  );
};

const DashboardPage: NextPage = () => {
  const [context, setContext] = useState("Blueprints");

  const { query } = useRouter();

  useEffect(() => {
    if (query.context) {
      setContext(query.context as string);
    }
  }, [query]);

  return (
    <>
      <Head>
        <title>{`Dashboard ${context === "Home" ? "(At a Glance)" : ""} ${
          context === "Blueprints" ? "(Blueprints)" : ""
        } ${context === "CrewMembers" ? "(Crew Members)" : ""} ${
          context === "Projects" ? "(Projects)" : ""
        } - War Manager`}</title>
        <meta property="og:title" content="Where you can manage anything." />
        <meta
          property="og:description"
          content="Start managing your projects, crew members, projects and more from the dashboard"
        />
        <meta property="og:image" content="/bhall_logo.png" />
        <meta name="description" content="Where you can manage anything." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-w-screen z-50 min-h-screen bg-zinc-800">
        <div className="flex items-center justify-between p-2 px-5 text-center text-lg font-semibold text-white">
          <div className="flex items-center justify-start gap-1">
            <Image
              src="/favicon.ico"
              width={24}
              height={24}
              alt="war manager logo"
            />
            <h1 className="text-sm sm:hidden lg:block lg:text-lg">
              War Manager Dashboard
            </h1>
          </div>
          <div className="text-md hidden flex-col justify-around gap-2 text-zinc-300 sm:flex sm:w-[45vw] sm:flex-row">
            <TooltipComponent
              content="View Overall JR&CO Performance"
              side="bottom"
            >
              <button
                onClick={() => setContext("Home")}
                className={`w-full  transition-all duration-200 ${
                  context === "Home"
                    ? "rounded bg-amber-800 hover:bg-amber-700"
                    : "rounded hover:bg-zinc-800"
                }`}
              >
                At a Glance
              </button>
            </TooltipComponent>
            <TooltipComponent content="View all Blueprints" side="bottom">
              <button
                onClick={() => setContext("Blueprints")}
                className={`w-full  transition-all duration-200 ${
                  context === "Blueprints"
                    ? "rounded bg-amber-800 hover:bg-amber-700"
                    : "rounded hover:bg-zinc-800"
                }`}
              >
                Blueprints
              </button>
            </TooltipComponent>
            <TooltipComponent content="View all Crew Members" side="bottom">
              <button
                onClick={() => setContext("CrewMembers")}
                className={`w-full  transition-all duration-200 ${
                  context === "CrewMembers"
                    ? "rounded bg-amber-800 hover:bg-amber-700"
                    : "rounded hover:bg-zinc-800"
                }`}
              >
                Crew Members
              </button>
            </TooltipComponent>
            <TooltipComponent content="View all Projects" side="bottom">
              <button
                onClick={() => setContext("Projects")}
                className={`w-full transition-all duration-200 ${
                  context === "Projects"
                    ? "rounded bg-amber-800 hover:bg-amber-700"
                    : "rounded hover:bg-zinc-800"
                }`}
              >
                Projects
              </button>
            </TooltipComponent>
          </div>
          <div className="sm:w-40">
            <SignedIn>
              <UserButton showName={true} />
            </SignedIn>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">{/* <CreateButtons /> */}</div>
          <SignedIn>
            <div className="flex justify-center">
              <div className="flex w-full flex-col justify-around sm:hidden sm:w-[45vw] sm:flex-row">
                <button
                  onClick={() => setContext("Home")}
                  className={`w-full p-2 text-lg font-bold transition-all duration-200 ${
                    context === "Home"
                      ? "rounded bg-amber-800 hover:bg-amber-700"
                      : "hover:bg-zinc-600"
                  }`}
                >
                  Home
                </button>

                <button
                  onClick={() => setContext("Blueprints")}
                  className={`w-full p-2 text-lg font-bold transition-all duration-200 ${
                    context === "Blueprints"
                      ? "rounded bg-amber-800 hover:bg-amber-700"
                      : "hover:bg-zinc-600"
                  }`}
                >
                  Blueprints
                </button>

                <button
                  onClick={() => setContext("CrewMembers")}
                  className={`w-full p-2 text-lg font-bold transition-all duration-200 ${
                    context === "CrewMembers"
                      ? "rounded bg-amber-800 hover:bg-amber-700"
                      : "hover:bg-zinc-600"
                  }`}
                >
                  Crew Members
                </button>

                <button
                  onClick={() => setContext("Projects")}
                  className={`w-full p-2 text-lg font-bold transition-all duration-200 ${
                    context === "Projects"
                      ? "rounded bg-amber-800 hover:bg-amber-700"
                      : "hover:bg-zinc-600"
                  }`}
                >
                  Projects
                </button>
              </div>
            </div>
            <div className="overflow-y-auto">
              {context == "Home" && <DashboardAtAGlance />}
              {context == "Blueprints" && <BlueprintsList />}
              {context == "CrewMembers" && <CrewMembers />}
              {context == "Projects" && <Projects />}
            </div>
          </SignedIn>
          <SignedOut>
            <div className="fixed flex h-screen w-screen flex-col items-center justify-center gap-4 rounded p-4 backdrop-blur backdrop-brightness-50">
              <p className="text-[1.5rem] font-bold">You are not signed in</p>
              <div className="flex w-full flex-col items-center justify-center ">
                <SignInButton mode="modal" redirectUrl="/dashboard">
                  <div className="w-3/12 rounded bg-red-600 p-2 text-center hover:bg-red-500">
                    Sign in
                  </div>
                </SignInButton>
              </div>
            </div>
          </SignedOut>
        </div>
      </div>
      {/* <div className="fixed inset-0 top-0 -z-10 min-h-screen bg-bhall bg-top" /> */}
    </>
  );
};

export default DashboardPage;
