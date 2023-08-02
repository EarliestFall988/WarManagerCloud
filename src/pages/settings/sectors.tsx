import { type NextPage } from "next";
import SettingsLayout from "~/components/settingsSideMenu";
import { api } from "~/utils/api";
import { useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "~/components/loading";
import TooltipComponent from "~/components/Tooltip";
import {
  PlusIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

import { useAutoAnimate } from "@formkit/auto-animate/react";

const SectorsSettingsPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data,
    isLoading: loadingSearch,
    isError: error,
  } = api.sectors.getByName.useQuery({
    name: searchTerm,
  });


  const [animationParent] = useAutoAnimate();


  const loading = loadingSearch;

  return (
    <SettingsLayout>
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
              className="rounded p-2 transition-all duration-100 hover:scale-105 hover:bg-zinc-700"
            >
              <PlusIcon className="h-6 w-6 text-zinc-100" />
            </Link>
          </TooltipComponent>
        </div>
        <div
          ref={animationParent}
          className="flex min-h-[10vh] flex-col overflow-y-auto overflow-x-clip border-t border-zinc-600 px-1 md:max-h-[85vh]"
        >
          {loading ? (
            <div className="flex h-full w-full items-center justify-center p-5">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-lg font-semibold text-red-500">
                There was an error. Try again later, or contact support.
              </p>
            </div>
          ) : (
            data?.map((sector) => (
              <div
                className="flex border-x border-b border-zinc-700 transition-all duration-100 hover:bg-zinc-800 "
                key={sector.id}
              >
                <Link
                  href={`/sectors/${sector.id}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-l  px-1 py-2  "
                >
                  <div className="w-1/2 px-2 text-left">
                    <div className="flex items-center justify-start text-xs md:hidden">
                      <div className="flex gap-1 rounded-full">
                        <div className="flex items-center gap-1 rounded-full">
                          <UserCircleIcon className="h-3 w-3 text-zinc-300" />
                          <p className="truncate text-zinc-300">
                            {sector._count.CrewMembers}
                          </p>
                        </div>
                        <div className="border-r border-zinc-600"></div>
                        <div className="flex items-center gap-1 rounded-full">
                          <WrenchScrewdriverIcon className="h-3 w-3 text-zinc-300" />
                          <p className="truncate text-zinc-300">
                            {sector._count.Projects}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="truncate font-semibold text-zinc-200 sm:text-lg">
                      {sector.name}
                    </p>
                    <p className="truncate text-sm text-zinc-300 sm:text-xs">
                      {sector.departmentCode}{" "}
                      <span className="text-zinc-500">Department code</span>
                    </p>
                  </div>
                  <div className="text-md hidden gap-2 md:flex md:w-1/3">
                    <TooltipComponent
                      content={`There ${
                        sector._count.CrewMembers == 1 ? "is" : "are"
                      } ${sector._count.CrewMembers} ${
                        sector._count.CrewMembers == 1 ? "person" : "people"
                      } in the ${sector.name} sector.`}
                      side="left"
                    >
                      <div className="flex items-center gap-1 rounded-full bg-zinc-700 px-2">
                        <UserCircleIcon className="h-3 w-3 text-zinc-300" />
                        <p className="sm:text-md truncate text-zinc-300">
                          {sector._count.CrewMembers}
                        </p>
                      </div>
                    </TooltipComponent>
                    <TooltipComponent
                      content={`There ${
                        sector._count.Projects == 1 ? "is" : "are"
                      } ${sector._count.Projects} ${
                        sector._count.Projects == 1 ? "project" : "projects"
                      } in the ${sector.name} sector.`}
                      side="right"
                    >
                      <div className="flex items-center gap-1 rounded-full bg-zinc-700 px-2">
                        <WrenchScrewdriverIcon className="h-3 w-3 text-zinc-300" />
                        <p className="sm:text-md truncate text-zinc-300">
                          {sector._count.Projects}
                        </p>
                      </div>
                    </TooltipComponent>
                  </div>
                  <div className="hidden sm:flex sm:w-1/3">
                    <p className="truncate text-center font-thin tracking-tight text-zinc-200">
                      {sector.description}
                    </p>
                  </div>
                </Link>
                <div className="flex justify-end">
                  {/* <Dialog.Root>
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
                      <Dialog.Overlay className="fixed inset-0 top-0 flex animate-overlayDrawerShow items-center justify-center bg-black/30 backdrop-blur-sm" />
                      <div className="flex h-screen w-screen items-center justify-center">
                        <Dialog.Content className="fade-y  fixed top-0 m-auto h-screen w-full border-zinc-600 bg-zinc-800 p-3 py-2 md:top-[30%] md:h-40 md:max-h-[80vh] md:w-1/4 md:rounded-lg md:border">
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
                                  handleDelete(sector);
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
                  </Dialog.Root> */}
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
    </SettingsLayout>
  );
};
export default SectorsSettingsPage;
