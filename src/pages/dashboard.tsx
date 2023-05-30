import type { NextPage } from "next";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Head from "next/head";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import type { Blueprint, CrewMember } from "@prisma/client";
import { useState } from "react";

dayjs.extend(relativeTime);

const CreateButtons = () => {
  return (
    <>
      <SignedIn>
        <div className="flex w-full flex-col gap-2 p-2 sm:w-3/4 sm:flex-row">
          <Link
            href="/newblueprint"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Blueprint
          </Link>
          <Link
            href="/newCrewMember"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Crew Member
          </Link>
          <Link
            href="/#"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Project
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex w-full flex-col gap-2 p-2 sm:w-3/4 sm:flex-row">
          <Link
            href="#"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Blueprint
          </Link>
          <Link
            href="#"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Crew Member
          </Link>
          <Link
            href="#"
            className="w-full rounded bg-gradient-to-br from-amber-700 to-red-700 p-1 text-center text-lg font-semibold transition-all duration-100 hover:from-amber-600 hover:to-red-600 "
          >
            New Project
          </Link>
        </div>
      </SignedOut>
    </>
  );
};

const BlueprintsList = () => {
  const { user } = useUser();

  const {
    data,
    isLoading: loadingBlueprints,
    isError: loadingBlueprintsError,
  } = api.blueprints.getAll.useQuery();

  // const data = props.data;

  if (loadingBlueprints)
    return (
      <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
        <LoadingSpinner />
      </div>
    );

  if (loadingBlueprintsError || !data)
    return (
      <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
        <p className="text-lg italic text-red-500">Could not load blueprints</p>
      </div>
    );

  // if (!data || !user) {
  //   return (
  //     <div className="m-auto flex h-[50vh] w-[80vw] flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2">
  //       <p className="text-lg italic text-red-500">Could not load blueprints</p>
  //     </div>
  //   );

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Blueprints
        </h2>
        <Link
          href="/newblueprint"
          className="rounded bg-gradient-to-br from-amber-700 to-red-700 p-2 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold "
        >
          New +
        </Link>
      </div>
      <div className="flex justify-center">
        <div className="flex w-full flex-col gap-1 p-2 text-gray-100 sm:w-11/12 md:w-3/4">
          {data?.map((blueprint) => (
            <Link
              href={`/blueprints/${blueprint.id}`}
              passHref
              className="flex w-full items-center justify-between rounded-sm bg-zinc-700 p-2 shadow-sm transition-all duration-100 hover:bg-zinc-600"
              key={blueprint.id}
            >
              <h2 className="w-3/2 truncate text-left text-lg font-bold sm:w-1/4">
                {blueprint.name}
              </h2>
              <div className="hidden font-thin sm:flex sm:w-1/2 ">
                <p className="w-full truncate text-ellipsis text-center">
                  {blueprint.description}
                </p>
              </div>
              <p className="w-1/4 truncate text-right text-sm italic">
                {dayjs(blueprint.createdAt).fromNow()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

const CrewMembers = () => {
  const { user } = useUser();

  const {
    data: crewData,
    isLoading,
    isError: loadingCrewError,
  } = api.crewMembers.getAll.useQuery();

  if (isLoading)
    return (
      <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
        <LoadingSpinner />
      </div>
    );

  if (loadingCrewError || !crewData)
    return (
      <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
        <p className="text-lg italic text-red-500">
          Could not load Crew Members
        </p>
      </div>
    );

  if (!crewData || !user) {
    return (
      <div className="m-auto flex h-[50vh] w-[80vw] flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
        <h2 className="text-center text-2xl font-bold text-gray-100">
          Crew Members
        </h2>
        <Link
          href="/newCrewMember"
          className="rounded bg-gradient-to-br from-amber-700 to-red-700 p-2 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold "
        >
          New +
        </Link>
      </div>
      <div className="flex justify-center">
        <div className="flex w-full flex-col gap-1 p-2 text-gray-100 sm:w-11/12 md:w-3/4">
          {crewData?.map((crewMember) => (
            <Link
              href={`/crewmember/${crewMember.id}`}
              passHref
              className="flex w-full items-center justify-between rounded-sm bg-zinc-700 p-2 shadow-sm transition-all duration-100 hover:bg-zinc-600"
              key={crewMember.id}
            >
              <div className="w-3/2  text-left sm:w-1/3">
                <h2 className="truncate text-lg font-bold">
                  {crewMember.name}
                </h2>
                <h2 className="px-2 italic tracking-tight text-zinc-300 ">
                  {crewMember.position}
                </h2>
              </div>
              <div className="hidden px-1 tracking-tight sm:flex sm:w-1/2 ">
                <p className="h-full w-full truncate text-left italic text-zinc-300">
                  {crewMember.description}
                </p>
              </div>
              <div className="hidden w-1/6 truncate text-right text-sm italic sm:flex">
                <p className="w-full text-right">
                  {dayjs(crewMember.createdAt).fromNow()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
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

const DashboardPage: NextPage = () => {
  const [context, setContext] = useState("Home");

  // if (!user || !user.primaryEmailAddress) {
  //   return <LoadingPage />;
  // }

  // const {
  //   data: blueprintData,
  //   isLoading: loadingBlueprints,
  //   isError: loadingBlueprintsError,
  // } = api.blueprints.getAll.useQuery();

  // const {
  //   data: crewData,
  //   isLoading: loadingCrew,
  //   isError: loadingCrewError,
  // } = api.crewMembers.getAll.useQuery();

  // const isError = true;

  // const loading = true;

  // if (!user || !user.primaryEmailAddress)
  //   return (
  //     <div className="flex h-screen items-center  bg-zinc-800 sm:justify-center">
  //       <div className="flex h-[25vh] w-[100vw] flex-col justify-around gap-4 sm:items-center">
  //         <p className="px-4 text-left text-[1.25rem] italic text-red-500 sm:text-center sm:text-lg sm:font-semibold">
  //           Hold up! :{")"}
  //         </p>
  //         <p className="p-4 text-2xl font-bold tracking-tight sm:text-center sm:text-[3rem]">
  //           You must be logged in to view your dashboard
  //         </p>
  //         <div className="w-full bg-red-500 p-2 text-center sm:w-1/6 sm:rounded">
  //           <SignInButton mode="modal" redirectUrl="/dashboard" />
  //         </div>
  //       </div>
  //     </div>
  //   );

  // if (loadingBlueprintsError)
  //   return (
  //     <div className="flex h-screen items-center bg-zinc-800 sm:justify-center">
  //       There was an error loading your dashboard. Please try again later
  //     </div>
  //   );

  return (
    <>
      <Head>
        <title>Dashboard - War Manager</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-w-screen min-h-screen bg-zinc-800">
        <div className="flex items-center justify-between bg-zinc-700 p-2 px-5 text-center text-lg font-semibold text-gray-100 shadow-md">
          <div className="hidden w-40 sm:flex" />
          <h1>Dashboard</h1>
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
              <div className="flex w-full flex-col justify-around bg-zinc-700 sm:w-[45vw] sm:flex-row ">
                <button
                  onClick={() => setContext("Home")}
                  className="w-full  bg-zinc-700 p-2 text-lg font-bold transition-all duration-100 hover:bg-zinc-600"
                >
                  Home
                </button>

                <button
                  onClick={() => setContext("Blueprints")}
                  className="w-full bg-zinc-700 p-2 text-lg font-bold transition-all duration-100 hover:bg-zinc-600"
                >
                  Blueprints
                </button>

                <button
                  onClick={() => setContext("CrewMembers")}
                  className="w-full bg-zinc-700 p-2 text-lg font-bold transition-all duration-100 hover:bg-zinc-600"
                >
                  Crew Members
                </button>

                <button
                  onClick={() => setContext("Projects")}
                  className="w-full bg-zinc-700 p-2 text-lg font-bold transition-all duration-100 hover:bg-zinc-600"
                >
                  Projects
                </button>
              </div>
            </div>

            {context == "Home" && (
              <>
                <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
                  <h2 className="p-2 text-center text-2xl font-bold text-gray-100">
                    Home
                  </h2>
                </div>
                <Loader />
              </>
            )}
            {context == "Blueprints" && <BlueprintsList />}
            {context == "CrewMembers" && <CrewMembers />}
            {context == "Projects" && (
              <>
                <div className="m-auto flex w-[90vw] items-center justify-between gap-2 sm:w-[74vw] ">
                  <h2 className="text-center text-2xl font-bold text-gray-100">
                    Projects
                  </h2>
                  <Link
                    href="/newblueprint"
                    className="rounded bg-gradient-to-br from-amber-700 to-red-700 p-2 text-center transition-all duration-100 hover:from-amber-600 hover:to-red-600 sm:text-lg sm:font-semibold "
                  >
                    New +
                  </Link>
                </div>
                <Loader />
              </>
            )}
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
    </>
  );
};

export default DashboardPage;
