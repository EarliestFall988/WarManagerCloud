import type { NextPage } from "next";
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Head from "next/head";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import type { Blueprint } from "@prisma/client";

dayjs.extend(relativeTime);

const CreateButtons = () => {
  return (
    <>
      <SignedIn>
        <div className="flex w-full flex-col gap-2 p-2 md:w-3/4 md:flex-row">
          <Link
            href="/newBlueprint"
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
        <div className="flex w-full flex-col gap-2 p-2 md:w-3/4 md:flex-row">
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

const BlueprintsList = (props: { data: Blueprint[] | undefined }) => {
  return (
    <>
      <div className="flex justify-center">
        <div className="flex w-full flex-col gap-1 p-2 text-gray-100 md:w-3/4">
          {props.data?.map((blueprint) => (
            <Link
              href={`/blueprints/${blueprint.id}`}
              passHref
              className="flex w-full items-center justify-between rounded-sm bg-zinc-700 p-2 shadow-sm transition-all duration-100 hover:bg-zinc-500"
              key={blueprint.id}
            >
              <h2 className="w-3/2 truncate text-left text-lg font-bold md:w-1/4">
                {blueprint.name}
              </h2>
              <div className="hidden justify-center  truncate font-thin md:flex md:w-1/4">
                <p>{blueprint.description}</p>
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

const Loader = () => {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 ">
      <LoadingSpinner />
      <p className="text-lg text-red-500">Getting your data, one sec...</p>
    </div>
  );
};

const DashboardPage: NextPage = () => {
  const { user } = useUser();

  if (!user || !user.primaryEmailAddress) {
    return <LoadingPage />;
  }

  const {
    data: blueprintData,
    isLoading: loadingBlueprints,
    isError: loadingBlueprintsError,
  } = api.blueprints.getAll.useQuery();

  const {
    data: crewData,
    isLoading: loadingCrew,
    isError: loadingCrewError,
  } = api.crewMembers.getAll.useQuery();

  // const isError = true;

  // const loading = true;

  if (
    (!user || !user.primaryEmailAddress) &&
    (loadingBlueprintsError || loadingCrewError)
  )
    return (
      <div className="flex h-screen items-center  bg-zinc-800 sm:justify-center">
        <div className="flex h-[25vh] w-[100vw] flex-col justify-around gap-4 sm:items-center">
          <p className="px-4 text-left text-[1.25rem] italic text-red-500 sm:text-center sm:text-lg sm:font-semibold">
            Hold up! :{")"}
          </p>
          <p className="p-4 text-2xl font-bold tracking-tight sm:text-center sm:text-[3rem]">
            You must be logged in to view your dashboard
          </p>
          <div className="w-full bg-red-500 p-2 text-center sm:w-1/6 sm:rounded">
            <SignInButton mode="modal" redirectUrl="/dashboard" />
          </div>
        </div>
      </div>
    );

  if (loadingBlueprintsError || loadingCrewError)
    return (
      <div className="flex h-screen items-center bg-zinc-800 sm:justify-center">
        There was an error loading your dashboard. Please try again later
      </div>
    );

  return (
    <>
      <Head>
        <title>Dashboard - War Manager</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-w-screen min-h-screen bg-zinc-800">
        <div className="flex items-center justify-between bg-zinc-700 p-2 px-5 text-center text-lg font-semibold text-gray-100 shadow-md">
          <div className="hidden md:flex" />
          <h1>Dashboard</h1>
          <div className="rounded ">
            <SignedIn>
              <UserButton showName={true} />
            </SignedIn>
          </div>
        </div>
        <div className="flex justify-center">
          <CreateButtons />
        </div>
        {loadingBlueprints || loadingCrew ? (
          <Loader />
        ) : (
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-100">
              Blueprints
            </h2>
            <BlueprintsList data={blueprintData} />
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-100">
                Crew Members
              </h2>
              <div className="flex justify-center">
                <div className="flex w-full flex-col gap-1 p-2 text-gray-100 md:w-3/4">
                  {crewData?.map((crewMember) => (
                    <Link
                      href={`/crewmember/${crewMember.id}`}
                      passHref
                      className="flex w-full items-center justify-between rounded-sm bg-zinc-700 p-2 shadow-sm transition-all duration-100 hover:bg-zinc-500"
                      key={crewMember.id}
                    >
                      <h2 className="w-3/2 truncate text-left text-lg font-bold md:w-1/4">
                        {crewMember.name}
                      </h2>
                      <div className="hidden justify-center  truncate font-thin md:flex md:w-1/4">
                        <p>{crewMember.description}</p>
                      </div>
                      <p className="w-1/4 truncate text-right text-sm italic">
                        {dayjs(crewMember.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
