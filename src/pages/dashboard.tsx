import type { NextPage } from "next";
import { LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Head from "next/head";
import { SignOutButton, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import React, {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  type FunctionComponent,
} from "react";
import { useRouter } from "next/router";
import {
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  ClipboardDocumentIcon,
  Cog6ToothIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  InboxIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import * as Progress from "@radix-ui/react-progress";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";

import { toast } from "react-hot-toast";
import TooltipComponent from "~/components/Tooltip";
import { ReactECharts } from "~/components/charts/React-Echarts";
// import GaugeOption from "~/components/charts/GaugeChartDataTest";
// import PieChartOption from "~/components/charts/PieChartDataTest";
import BarChartOption from "~/components/charts/BarChartDataTest";
// import CalendarHeatMapOption from "~/components/charts/CalendarHeatMapDataTest";
import {
  ProjectPerformanceRatingCustomer,
  ProjectPerformanceRatingQuality,
  ProjectPerformanceRatingSafety,
  ProjectPerformanceRatingStaffing,
} from "~/components/charts/PerformanceDataPieChart";
import SunBurstTestOption from "~/components/charts/SunburstDataTest";
import { ReactEChartsLarge } from "~/components/charts/React-EchartsLarge";
import * as Tabs from "@radix-ui/react-tabs";
import { LogoComponent } from "~/components/RibbonLogo";
import SignInModal from "~/components/signInPage";
import { TagComponent } from "~/components/TagComponent";
import { type Project } from "@prisma/client";

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
      <div className=" flex w-full items-center justify-start gap-1 p-2">
        <input
          type="search"
          value={blueprintSearchTerm}
          onChange={(e) => setBlueprintSearchTerm(e.target.value)}
          placeholder="search blueprints"
          className="w-full rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700 sm:w-3/5"
        />
        <TooltipComponent content="Create a New Blueprint" side="bottom">
          <Link
            href="/newblueprint"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-zinc-700 bg-gradient-to-br text-center transition-all duration-100 hover:bg-amber-700 sm:text-lg sm:font-semibold"
          >
            <PlusIcon className="h-6 w-6" />
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
          <div className="flex w-full flex-col gap-1 border-t border-zinc-700 p-2 text-gray-100">
            {data?.map((blueprint) => (
              <div
                key={blueprint.id}
                className="flex w-full items-center justify-between gap-1 rounded-sm "
              >
                <Link
                  href={`/blueprints/${blueprint.id}`}
                  passHref
                  className="flex w-full cursor-pointer items-center justify-between gap-1 rounded-sm bg-zinc-700 p-2 transition-all duration-100 hover:bg-zinc-600"
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
              </div>
            ))}
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

const PositionTag = (props: { position: string }) => {
  let style = "border-zinc-600 text-gray-100 font-thin";

  switch (props.position.toLowerCase()) {
    case "laborer":
      style = "border-amber-600 text-amber-600";
      break;
    case "project manager":
      style = "border-purple-500 text-purple-500 font-semibold";
      break;
    case "foreman":
      style = "border-amber-400 text-amber-400 font-semibold";
      break;
    case "specialist foreman":
      style = "border-orange-300 text-orange-300";
      break;
    case "specialist":
      style = "border-green-200 text-green-200";
      break;
    case "superintendent":
      style = "border-red-500 text-red-500 font-semibold";
      break;

    case "machine operator":
      style = "border-gray-500 text-gray-300 font-semibold";
      break;
    case "travel":
      style = "border-sky-500 text-sky-300";
      break;
    case "shingle":
      style = "border-orange-300 text-orange-300";
      break;
    case "tpo":
      style = "border-blue-500 text-blue-500";
      break;
    case "subcontractor":
      style = "border-green-400 text-green-400";
      break;

    default:
      break;
  }

  return (
    <div
      className={`${style} flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-1 text-sm`}
    >
      <p>{props.position}</p>
    </div>
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
      <div className="flex w-full items-center justify-start gap-1 p-2 ">
        <input
          type="search"
          value={crewSearchTerm}
          onChange={(e) => setCrewSearchTerm(e.target.value)}
          placeholder="search crew members by name, or position"
          className="w-full rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700 sm:w-3/5"
        />
        <div className="flex gap-1">
          <TooltipComponent content="Add a New Crew Member" side="bottom">
            <Link
              href="/newCrewMember"
              className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
            >
              <PlusIcon className="h-6 w-6 text-zinc-100" />
            </Link>
          </TooltipComponent>
          <TooltipComponent
            content="Download Crew Members Spreadsheet"
            side="bottom"
          >
            <Link
              href="/crewmember/download"
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2">
          <LoadingSpinner />
        </div>
      ) : loadingCrewError || !crewData ? (
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded p-2">
          <p className="text-[3rem] italic text-red-500">could not load data</p>
        </div>
      ) : (
        <div className="flex h-[80vh] w-full flex-col  items-start justify-start gap-1 overflow-y-auto overflow-x-hidden border-t border-zinc-700 p-2 text-gray-100 md:h-[94vh]">
          <div className="flex gap-1 rounded-sm bg-zinc-700 p-1 sm:w-10/12 lg:w-full">
            {/* <div className="w-1/2 "></div>
            <div>test</div> */}
          </div>
          {crewData.length > 0 &&
            crewData?.map((crewMember) => (
              <div
                className="flex h-12 rounded-sm bg-zinc-700 hover:bg-zinc-600 sm:w-10/12 lg:w-full select-none cursor-pointer"
                key={crewMember.id}
              >
                <Link
                  href={`/crewmember/${crewMember.id}`}
                  passHref
                  className="flex w-11/12 flex-grow items-center gap-1 overflow-x-clip rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between"
                >
                  {/* <UserCircleIcon className="hidden h-10 w-10 flex-1 text-zinc-300 md:block" /> */}
                  <div className="flex w-full flex-col items-start justify-start text-left text-white lg:w-1/2">
                    <div className="flex items-center justify-start gap-1">
                      <p className="truncate text-lg font-semibold text-white ">
                        {crewMember.name}
                      </p>
                      {/* <div className="whitespace-nowrap rounded-full border px-1 text-sm italic tracking-tight text-zinc-400"> */}
                      <PositionTag position={crewMember.position} />
                      {/* </div> */}
                      {crewMember.description
                        .toLowerCase()
                        .includes("travel") &&
                        !crewMember.description.toLowerCase().includes("not") &&
                        !crewMember.description
                          .toLowerCase()
                          .includes("n't") && (
                          <PositionTag position={"Travel"} />
                        )}
                      {crewMember.description.toLowerCase().includes("tpo") &&
                        !crewMember.description.toLowerCase().includes("not") &&
                        !crewMember.description
                          .toLowerCase()
                          .includes("n't") && <PositionTag position={"TPO"} />}
                      {crewMember.description
                        .toLowerCase()
                        .includes("shingle") &&
                        !crewMember.description.toLowerCase().includes("not") &&
                        !crewMember.description
                          .toLowerCase()
                          .includes("n't") && (
                          <PositionTag position={"Shingle"} />
                        )}
                    </div>
                    <div className="flex w-full items-center justify-start gap-1 overflow-clip text-zinc-400">
                      {crewMember.phone && (
                        <PhoneIcon className="h-4 w-4 text-zinc-200" />
                      )}
                      <p className="whitespace-nowrap text-sm tracking-tight">
                        {crewMember.phone}
                      </p>
                      {crewMember.email && (
                        <>
                          <p className="truncate text-left text-sm tracking-tight">
                            •
                          </p>
                          <InboxIcon className="h-4 w-4 text-zinc-200" />
                        </>
                      )}
                      <p className="w-full truncate text-sm tracking-tight">
                        {crewMember.email}
                      </p>
                    </div>
                  </div>
                  <p className="hidden flex-grow truncate tracking-tight md:block lg:w-1/4 ">
                    {crewMember.description}
                  </p>
                  <p className="hidden w-1/12 truncate text-left text-sm italic sm:block">
                    <span className="text-zinc-400">updated</span>
                    {dayjs(crewMember.updatedAt).fromNow()}
                  </p>
                </Link>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex w-1/12 items-center justify-end rounded-sm bg-transparent p-1 transition-all duration-100 md:w-auto">
                      <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="TooltipContent w-44 rounded border border-zinc-700 bg-black/50 p-3 py-2 drop-shadow-lg backdrop-blur ">
                      <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-700" />
                      <DropdownMenu.Item
                        className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
                        onClick={(e) => {
                          e.preventDefault();
                          copy(crewMember.email, "Email");
                        }}
                      >
                        <ClipboardDocumentIcon className="h-5 w-5 text-zinc-200 " />
                        Copy Email
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
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
    </>
  );
};

// const StatusTagComponent = (props: { name: string }) => {
//   const status = props.name.toLowerCase();

//   let style = "border-zinc-400 border text-zinc-400";

//   if (status.startsWith("start") && !status.includes("2 weeks")) {
//     style = "border-yellow-200 border text-yellow-200";
//   } else if (status.trim() === "start 2 weeks") {
//     style = "border-orange-400 border text-orange-400";
//   } else if (status.trim().startsWith("mf")) {
//     style = "border-blue-400 border text-blue-400";
//   } else if (status.trim() === "legal") {
//     style = "border-red-400 border text-red-400";
//   } else if (status.trim() === "in progress: good") {
//     style = "border-green-400 border text-green-400";
//   } else if (status.trim() === "in progress: bad") {
//     style = "border-red-400 border-2 text-red-400";
//   } else if (status.trim() === "100% complete") {
//     style = "border-green-600 border text-green-200 bg-green-800";
//   }

//   return (
//     <p
//       className={`${style} whitespace-nowrap rounded-full px-1 text-center text-xs`}
//     >
//       {props.name}
//     </p>
//   );
// };

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

  console.log(data);

  return (
    <>
      <div className="flex w-full items-center justify-start gap-1 p-2">
        <input
          type="search"
          value={projectSearchTerm}
          onChange={(e) => setProjectsSearchTerm(e.target.value)}
          placeholder="search projects by name, job code, or address"
          className="w-full rounded bg-zinc-700 p-2 outline-none ring-2 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-600 focus:ring-amber-700 sm:w-3/5"
        />
        <div className="flex gap-1">
          <TooltipComponent content="Add a New Project" side="bottom">
            <Link
              href="/newproject"
              className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
            >
              <PlusIcon className="h-6 w-6 text-zinc-100" />
            </Link>
          </TooltipComponent>
          <TooltipComponent
            content="Download Projects Spreadsheet"
            side="bottom"
          >
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
        </div>
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
          <div className="h-[80vh] overflow-y-auto overflow-x-hidden md:h-[94vh] ">
            <div className="flex w-full flex-col gap-1 border-t border-zinc-700 p-2 text-gray-100 ">
              {data?.map((project, index) => (
                <div key={project.id} className="rounded-sm bg-zinc-700 hover:bg-zinc-600 select-none w-full">
                  <div
                    className="flex md:1/2 items-center gap-1 "
                  >
                    {/* <WrenchScrewdriverIcon className="hidden h-8 w-8 text-zinc-300 sm:block" /> */}
                    <Link
                      href={`/projects/${project.id}`}
                      passHref
                      className="flex w-full items-center gap-1 overflow-hidden rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between cursor-pointer"
                    >
                      <div className="w-full sm:w-1/2">
                        <div className="flex w-full items-center justify-start gap-1 overflow-clip">
                          <p className="whitespace-nowrap text-sm font-normal text-zinc-300">
                            {project.jobNumber}
                          </p>
                          <p className="truncate text-ellipsis ">
                            {project.name}
                          </p>
                          {
                            project.tags.length > 0 && (
                              <div className="flex gap-1 w-1/2 flex-wrap">
                                {
                                  project.tags.map((tag) => (
                                    <TagComponent tag={tag} key={tag.id} style="text-xs" />
                                  ))
                                }
                              </div>
                            )
                          }
                        </div>
                        <div className="flex w-full items-center justify-start gap-1 overflow-clip text-zinc-300">
                          <div className="w-2/7 flex items-center justify-start gap-1 overflow-clip">
                            <MapPinIcon className="h-4 w-4" />
                            <p className="block max-w-[7rem] truncate text-left text-sm font-normal italic tracking-tight">
                              {project.city.trim()}
                              {project.state.trim() && `, ${project.state}`}
                            </p>
                          </div>
                          <p>·</p>
                          <p className="text-sm" >{project.status}</p>
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
                        <DropdownMenu.Content className="TooltipContent w-44 rounded border border-zinc-600 bg-black/50 p-3 py-2 drop-shadow-lg backdrop-blur ">
                          <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-600" />
                          <DropdownMenu.Item
                            className="flex items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
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
                              <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/50 backdrop-blur" />
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
                  <ProjectProgress project={project} index={index} />
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



const ProjectProgress: React.FC<{ project: Project, index: number }> = ({ project, index }) => {


  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(project.percentComplete), 500 * (index / 3) + 500);
    return () => clearTimeout(timer);
  }, []);


  return (
    <TooltipComponent content={`${project.name} is ${progress}% Complete`} side="bottom">
      {/* {progress === 0 && <div className="relative overflow-hidden rounded-b-sm bg-zinc-700 w-full h-[4px]">
      </div>
      } */}
      <Progress.Root
        className="relative overflow-hidden rounded-b-sm bg-zinc-700 w-full h-[4px]"
        style={{
          // Fix overflow clipping in Safari
          // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
          transform: 'translateZ(0)',
        }}
        value={progress}
      >
        <Progress.Indicator style={{ transform: `translateX(-${100 - progress}%)` }} className="rounded-md bg-gradient-to-r from-orange-600  to-amber-700  w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]" />
      </Progress.Root>
    </TooltipComponent>
  )
}

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
        className={`${open ? "h-72 w-1/4" : "h-14 w-1/4"
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
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="my-1 h-80 rounded bg-zinc-200 shadow-lg md:w-3/6">
            <h3 className="py-2 text-center text-lg font-semibold text-zinc-900">
              All Jobs
            </h3>
            <ReactECharts option={BarChartOption} width="w-full" />
          </div>
          <div className="flex w-full flex-col justify-start gap-1 md:flex-row">
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
          <div className="m-5 h-full rounded">
            <ReactEChartsLarge option={SunBurstTestOption} />
          </div>
        </>
      )}
    </>
  );
};

type Props = {
  children: ReactNode;
};
const SettingsButton: FunctionComponent<Props> = (props) => {
  return (
    <Dialog.Root>
      <TooltipComponent content="Settings" side="left">
        <Dialog.Trigger className="flex items-center justify-start gap-2 border-b border-zinc-700 p-2 text-white hover:bg-zinc-700 ">
          <Cog6ToothIcon className="h-7 w-7 text-zinc-300" />
          Settings
        </Dialog.Trigger>
      </TooltipComponent>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur-sm" />
        <div className="flex h-screen w-screen items-center justify-center">
          <Dialog.Content className="fixed top-0 m-auto h-screen w-full border-zinc-600 bg-zinc-800 p-3 py-2 md:top-[11%] md:max-h-[80vh] md:w-3/4 md:rounded-lg md:border">
            <div className="flex w-full justify-between ">
              <Dialog.Title className="text-lg font-bold text-white">
                Settings
              </Dialog.Title>
              <TooltipComponent content="Close" side="bottom">
                <Dialog.Close asChild>
                  <button className="rounded p-2 text-center transition-all duration-100 hover:text-red-600">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Close>
              </TooltipComponent>
            </div>
            {props.children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const SectorsView = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading: loadingSearch,
    isError: error,
  } = api.sectors.getByName.useQuery({
    name: searchTerm,
  });

  const context = api.useContext();

  const { mutate, isLoading: isDeleting } = api.sectors.delete.useMutation({
    onSuccess: () => {
      void context.invalidate();
      toast.success("Sector deleted successfully");
    },

    onError: (error) => {
      console.log(error);
      toast.error("Error deleting sector");
    },
  });

  const handleDelete = (id: string) => {
    toast.loading("Deleting sector...", {
      duration: 1000,
    });

    mutate({
      id,
    });
  };

  const loading = loadingSearch || isDeleting;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <input
          className="w-full rounded bg-zinc-700 p-2 text-zinc-200 shadow outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-2 focus:ring-amber-500"
          placeholder="Search for a sector..."
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <TooltipComponent content="Add Sector" side="right">
          <Link
            href="/sectors/new"
            className="rounded bg-amber-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-amber-600"
          >
            <PlusIcon className="h-6 w-6 text-zinc-100" />
          </Link>
        </TooltipComponent>
      </div>
      <div className="flex max-h-[70vh] min-h-[10vh] flex-col gap-1 overflow-y-auto overflow-x-clip border-t border-zinc-600 pt-1 md:max-h-[60vh] md:px-2">
        {loading ? (
          <div className="flex h-[10vh] w-full items-center justify-center p-5">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex h-[10vh] items-center justify-center">
            <p className="text-center text-lg font-semibold text-red-500">
              There was an error. Try again later, or contact support.
            </p>
          </div>
        ) : (
          data?.map((sector) => (
            <div
              className="flex rounded bg-zinc-700 hover:bg-zinc-600 "
              key={sector.id}
            >
              <Link
                href={`/sectors/${sector.id}`}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-l  px-1 py-2  "
              >
                <div className="w-1/2  text-left">
                  <p className="truncate font-semibold text-zinc-200 sm:text-lg">
                    {sector.name}
                  </p>
                  <p className="truncate text-sm text-zinc-300 sm:text-xs">
                    {sector.departmentCode}
                  </p>
                </div>
                <div className="hidden sm:flex sm:w-1/3">
                  <p className="truncate text-center font-thin italic tracking-tight text-zinc-200">
                    {sector.description}
                  </p>
                </div>
              </Link>
              <div className="flex justify-end">
                <Dialog.Root>
                  <TooltipComponent
                    content={`Delete ${sector.name}`}
                    side="bottom"
                  >
                    <Dialog.Trigger asChild>
                      <button className="rounded p-2 text-center text-zinc-400 transition-all duration-100 hover:text-red-600">
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </Dialog.Trigger>
                  </TooltipComponent>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur-sm" />
                    <div className="flex h-screen w-screen items-center justify-center">
                      <Dialog.Content className="fixed top-0 m-auto h-screen w-full border-zinc-600 bg-zinc-800 p-3 py-2 md:top-[30%] md:h-40 md:max-h-[80vh] md:w-1/4 md:rounded-lg md:border">
                        <div className="flex w-full justify-between ">
                          <Dialog.Title className="text-lg font-bold text-white">
                            Delete Sector
                          </Dialog.Title>
                          <Dialog.Close asChild>
                            <button className="rounded p-2 text-center transition-all duration-100 hover:text-red-600">
                              <XMarkIcon className="h-6 w-6" />
                            </button>
                          </Dialog.Close>
                        </div>
                        <p className="text-white">
                          Are you sure you want to delete this sector? This
                          action cannot be undone.
                        </p>
                        <div className="mt-2 flex justify-end">
                          <Dialog.Close asChild>
                            <button
                              onClick={() => {
                                handleDelete(sector.id);
                              }}
                              className="rounded bg-red-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-red-600"
                            >
                              <p className="text-center text-lg font-semibold text-white">
                                I Understand, Delete Anyway
                              </p>
                            </button>
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </div>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            </div>
          ))
        )}
        {data?.length === 0 && (
          <div className="flex h-[10vh] flex-col items-center justify-center gap-3">
            <p className="text-center text-2xl font-semibold text-zinc-400">
              No sectors found.
            </p>
            <Link
              href="/sectors/new"
              className="cursor-pointer rounded bg-amber-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-amber-600"
            >
              <p className="text-center text-lg font-semibold text-white">
                Create a sector now.
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <div className="flex flex-col gap-2 rounded">
      <Tabs.Root defaultValue="tab1">
        <Tabs.List
          className="border-mauve6 flex shrink-0 border-b"
          aria-label="Manage your account"
        >
          <Tabs.Trigger
            className=" flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-zinc-800 px-5 text-[15px] leading-none text-zinc-200 outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:text-amber-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
            value="tab1"
          >
            Sectors
          </Tabs.Trigger>
          <Tabs.Trigger
            className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-zinc-800 px-5 text-[15px] leading-none text-zinc-200 outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:text-amber-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
            value="tab2"
          >
            Permissions
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          className="grow bg-zinc-800 p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="tab1"
        >
          <SectorsView />
        </Tabs.Content>
        <Tabs.Content
          className="grow bg-zinc-800 p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="tab2"
        >
          <div className="text-center text-[2rem] font-semibold text-zinc-500">
            {"Under construction ... coming soon! "}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

const DashboardPage: NextPage = () => {
  const [context, setContext] = useState("Blueprints");

  const { query } = useRouter();

  const { user } = useUser();

  useEffect(() => {
    if (query.context) {
      setContext(query.context as string);
    }
  }, [query]);

  return (
    <>
      <Head>
        <title>{`Dashboard ${context === "Home" ? "(At a Glance)" : ""} ${context === "Blueprints" ? "(Blueprints)" : ""
          } ${context === "CrewMembers" ? "(Crew Members)" : ""} ${context === "Projects" ? "(Projects)" : ""
          } - War Manager`}</title>
      </Head>

      <main className="min-w-screen min-h-screen overflow-x-hidden bg-zinc-800">
        <div className="flex items-start justify-start">
          <div className="hidden h-screen w-1/6 flex-col items-start justify-between border-r border-zinc-700 md:flex">
            <div className="flex w-full flex-col">
              <TooltipComponent
                content="View Overall JR&CO Performance"
                side="right"
              >
                <button
                  onClick={() => setContext("Home")}
                  className={`w-full  p-2 font-semibold transition-all duration-200 ${context === "Home"
                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                    : " border-b border-zinc-700 hover:bg-zinc-700"
                    }`}
                >
                  Glance
                </button>
              </TooltipComponent>
              <TooltipComponent content="View all Blueprints" side="right">
                <button
                  onClick={() => setContext("Blueprints")}
                  className={`w-full  p-2 font-semibold transition-all duration-200 ${context === "Blueprints"
                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                    : " border-b border-zinc-700 hover:bg-zinc-700"
                    }`}
                >
                  Blueprints
                </button>
              </TooltipComponent>
              <TooltipComponent content="View all Crew Members" side="right">
                <button
                  onClick={() => setContext("CrewMembers")}
                  className={`w-full  p-2 font-semibold transition-all duration-200 ${context === "CrewMembers"
                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                    : " border-b border-zinc-700 hover:bg-zinc-700"
                    }`}
                >
                  Crew
                </button>
              </TooltipComponent>
              <TooltipComponent content="View all Projects" side="right">
                <button
                  onClick={() => setContext("Projects")}
                  className={`w-full p-2 font-semibold transition-all duration-200 ${context === "Projects"
                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                    : " border-b border-zinc-700 hover:bg-zinc-700"
                    }`}
                >
                  Projects
                </button>
              </TooltipComponent>
            </div>
            <div className="flex w-full flex-col">
              <SettingsButton>
                <Settings />
              </SettingsButton>
              <TooltipComponent content="Landing Page" side="right">
                <div className="border-b border-zinc-700">
                  <Link
                    className="flex gap-2  p-2 transition-all duration-200 hover:bg-zinc-700"
                    href="/"
                  >
                    <LogoComponent />
                    War Manager
                  </Link>
                </div>
              </TooltipComponent>

              {user != null && (
                <div className="flex">
                  <div className="flex w-5/6 items-center gap-2 p-2 transition-all duration-200">
                    {/* <Image
                      src={user?.profileImageUrl}
                      width={40}
                      height={40}
                      alt={` ${user?.fullName || "unknown"}'s picture'`}
                      className="rounded-full"
                    /> */}
                    <UserButton />
                    <div className="flex flex-col md:w-4/6 xl:w-5/6 ">
                      <p className="w-full truncate font-semibold md:text-sm">
                        {user?.fullName}
                      </p>
                      <p className="w-full truncate text-sm text-zinc-400 md:text-xs">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <TooltipComponent content="Sign Out" side="right">
                    <div className="h-full w-full border-l border-zinc-700">
                      <SignOutButton>
                        <div className="duration 200 flex h-full w-full cursor-pointer items-center justify-center transition-all hover:bg-zinc-700">
                          <ArrowRightOnRectangleIcon className="h-6 w-6 text-zinc-100" />
                        </div>
                      </SignOutButton>
                    </div>
                  </TooltipComponent>
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 ">
            {user != null && user != undefined ? (
              <>
                <div className="h-[95vh] w-full overflow-y-auto md:h-auto">
                  {context == "Home" && <DashboardAtAGlance />}
                  {context == "Blueprints" && <BlueprintsList />}
                  {context == "CrewMembers" && <CrewMembers />}
                  {context == "Projects" && <Projects />}
                </div>
                <div className="fixed bottom-0 flex h-[10vh] w-full items-center justify-around gap-2 border-r border-zinc-700 p-2 md:hidden">
                  <div className="w-5"></div>
                  <div className="flex items-center justify-start gap-2">
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <button className="TooltipContent flex w-full gap-3 rounded-full bg-amber-700 p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-800">
                          <Bars3Icon className="h-6 w-6 text-zinc-300" />
                        </button>
                      </Dialog.Trigger>
                      {/* <div className="fixed z-20 top-0 w-screen h-screen flex items-center justify-center"> */}
                      <Dialog.Overlay className="TooltipContent fixed inset-0 bg-black/50 backdrop-blur" />
                      <Dialog.Content className="TooltipContent fixed inset-10 bottom-5 z-20 flex items-start justify-start rounded border border-zinc-700 bg-zinc-800">
                        <div className="flex w-full flex-col justify-start p-2">
                          <Dialog.DialogClose>
                            <button
                              className={`flex w-full items-center justify-center p-2 text-red-400 transition-all duration-200`}
                            >
                              <XMarkIcon className="h-6 w-6 " /> Close Menu
                            </button>
                          </Dialog.DialogClose>
                          <Dialog.DialogClose>
                            <button
                              onClick={() => setContext("Home")}
                              className={`w-full p-2 text-lg font-bold transition-all duration-200 ${context === "Home"
                                ? "rounded bg-amber-800 hover:bg-red-700"
                                : "border-b border-zinc-600 hover:bg-zinc-600"
                                }`}
                            >
                              Glance
                            </button>
                          </Dialog.DialogClose>

                          <Dialog.DialogClose>
                            <button
                              onClick={() => setContext("Blueprints")}
                              className={`w-full p-2 text-lg font-bold transition-all duration-200 ${context === "Blueprints"
                                ? "rounded bg-amber-800 hover:bg-red-700"
                                : "border-b border-zinc-600 hover:bg-zinc-600"
                                }`}
                            >
                              Blueprints
                            </button>
                          </Dialog.DialogClose>
                          <Dialog.DialogClose>
                            <button
                              onClick={() => setContext("CrewMembers")}
                              className={`w-full p-2 text-lg font-bold transition-all duration-200 ${context === "CrewMembers"
                                ? "rounded bg-amber-800 hover:bg-red-700"
                                : "border-b border-zinc-600 hover:bg-zinc-600"
                                }`}
                            >
                              Crew
                            </button>
                          </Dialog.DialogClose>
                          <Dialog.DialogClose>
                            <button
                              onClick={() => setContext("Projects")}
                              className={`w-full p-2 text-lg font-bold transition-all duration-200 ${context === "Projects"
                                ? "rounded bg-amber-800 hover:bg-red-700"
                                : "border-b border-zinc-600 hover:bg-zinc-600 "
                                }`}
                            >
                              Projects
                            </button>
                          </Dialog.DialogClose>
                        </div>
                      </Dialog.Content>
                      {/* </div> */}
                    </Dialog.Root>
                    {/* <div className="text font-semibold">
                      {context == "Home" && <p>Glance</p>}
                      {context == "Blueprints" && <p>Blueprints</p>}
                      {context == "CrewMembers" && <p>Crew Members</p>}
                      {context == "Projects" && <p>Projects</p>}
                    </div> */}
                  </div>
                  <div>
                    <UserButton />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* <div className="fixed flex h-screen w-screen flex-col items-center justify-center gap-4 rounded p-4 backdrop-blur backdrop-brightness-50">
                  <p className="text-[1.5rem] font-bold">
                    You are not signed in
                  </p>
                  <div className="flex w-full flex-col items-center justify-center ">
                    <SignInButton mode="modal" redirectUrl="/dashboard">
                      <div className="w-3/12 rounded bg-red-600 p-2 text-center hover:bg-red-500">
                        Sign in
                      </div>
                    </SignInButton>
                  </div>
                </div> */}

                <div className="bg-black-900 fixed inset-0 top-0">
                  <SignedOut>
                    <SignInModal redirectUrl="/dashboard" />
                  </SignedOut>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      {/* <div className="fixed inset-0 top-0 -z-10 min-h-screen bg-bhall bg-top" /> */}
    </>
  );
};

export default DashboardPage;
