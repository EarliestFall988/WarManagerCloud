import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import Head from "next/head";
import { DashboardMenu } from "~/components/dashboardMenu";
import SignInModal from "~/components/signInPage";

import {
  FunnelIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  TagIcon,
  PlusIcon,
  ArrowLongUpIcon,
  LinkIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { useState, useCallback } from "react";
import { TagsPopover } from "~/components/TagDropdown";
import { SimpleDropDown } from "~/components/dropdown";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Equipment, Sector, Tag } from "@prisma/client";
import TooltipComponent from "~/components/Tooltip";
import Link from "next/link";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import { CouldNotLoadMessageComponent } from "~/components/couldNotLoadMessageComponent";
import toast from "react-hot-toast";
import { TagBubblesHandler } from "~/components/TagComponent";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DialogComponent } from "~/components/dialog";
dayjs.extend(relativeTime);

const EquipmentPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [filterTags, setFilterTags] = useState<Tag[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  const [animationParent] = useAutoAnimate();

  const getFilterTagIds = useCallback(() => {
    return filterTags.map((tag) => tag.id);
  }, [filterTags]);

  const getSectorTagIds = useCallback(() => {
    return sectors.map((sector) => sector.id);
  }, [sectors]);

  const {
    data: equipment,
    isLoading,
    isLoadingError,
  } = api.equipment.search.useQuery({
    search: equipmentSearchTerm,
    filter: getFilterTagIds(),
    sectors: getSectorTagIds(),
  });

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/reporting" />;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>Equipment | War Manager</title>
      </Head>
      <main className="flex min-h-[100vh] bg-zinc-900">
        <DashboardMenu />

        <div className="w-full">
          <div className="flex w-full items-center justify-between gap-1 p-2">
            <div className="flex w-full gap-1">
              <input
                type="search"
                value={equipmentSearchTerm}
                onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                placeholder="Search Equipment by Name, Type, or ID"
                className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 md:w-3/5"
              />
              <TagsPopover
                type={"crews and sectors"}
                savedTags={filterTags}
                savedSectors={sectors}
                onSetSectors={(e) => setSectors(e)}
                onSetTags={(e) => setFilterTags(e)}
              >
                <button className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700">
                  <FunnelIcon className="h-6 w-6 text-zinc-100" />
                </button>
              </TagsPopover>
            </div>
            <EquipmentLinks className="hidden gap-1 md:flex" />
            <SimpleDropDown
              trigger={
                <div className="flex items-center justify-center p-2 md:hidden">
                  <EllipsisVerticalIcon className="h-6 w-6 text-zinc-100" />
                </div>
              }
            >
              <EquipmentLinks className="flex gap-1" />
            </SimpleDropDown>
          </div>
          <div
            ref={animationParent}
            className="flex flex-col items-start justify-start gap-1 border-t border-zinc-700 p-2 text-gray-100"
          >
            {isLoading ? (
              <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-2">
                <LoadingSpinner />
                <p className="font-semibold text-zinc-600">Loading Equipment</p>
              </div>
            ) : isLoadingError || !equipment ? (
              <CouldNotLoadMessageComponent pluralName="equipment" />
            ) : (
              <>
                {equipment.length > 0 &&
                  equipment?.map((e) => (
                    <EquipmentItem
                      key={e.id}
                      equipment={e}
                      tags={e.tags}
                      sector={e.sector}
                      removeEquipmentItem={() => {
                        console.log("delete!");
                      }}
                    />
                  ))}
                {equipment.length === 0 && (
                  <div className="flex h-[33vh] w-full flex-col items-center justify-center gap-2">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-xl font-bold text-zinc-300">
                        No Equipment items matching your search
                      </p>
                      <Link
                        href="/equipment/new"
                        className="m-auto flex w-64 items-center justify-center gap-2 rounded bg-amber-800 p-2 text-center font-bold text-zinc-300 transition-all duration-100 hover:scale-105 hover:cursor-pointer hover:bg-amber-700"
                      >
                        <p>Create one now</p>
                        <ArrowRightIcon className="h-6 w-6" />
                      </Link>
                    </div>
                  </div>
                )}

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
            )}
          </div>
        </div>
      </main>
    </>
  );
};

const EquipmentItem: React.FC<{
  equipment: Equipment;
  tags: Tag[];
  sector: Sector | null | undefined;
  removeEquipmentItem: (id: string) => void;
}> = ({ equipment, tags, removeEquipmentItem: removeCrewMember, sector }) => {
  const copy = useCallback((text: string, type: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${type}Copied to clipboard`);
  }, []);

  return (
    <div
      className="flex w-full cursor-pointer select-none rounded-sm bg-zinc-700 transition-all duration-100 hover:bg-zinc-600"
      key={equipment.id}
    >
      <Link
        href={`/equipment/${equipment.id}`}
        passHref
        className="flex flex-grow items-center gap-1 overflow-x-clip rounded-sm p-1 sm:justify-between"
      >
        {/* <UserCircleIcon className="hidden h-10 w-10 flex-1 text-zinc-300 md:block" /> */}
        <div className="flex flex-grow flex-col text-left text-white md:max-w-[40%] lg:w-1/3">
          <div className="flex items-center justify-start gap-2">
            {sector && (
              <p className="truncate rounded-full bg-zinc-500 px-2 text-xs font-semibold text-zinc-100 ">
                {sector?.name}
              </p>
            )}
            <p className="truncate text-xs text-zinc-300 ">{equipment.type}</p>
          </div>
          <div className="flex w-full items-center justify-start gap-1 ">
            <p className="truncate text-lg font-semibold text-white ">
              {equipment.name}
            </p>
            <TagBubblesHandler
              tags={tags}
              equipment={equipment}
              mode="equipment"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <p className="min-w-[0em] truncate text-zinc-300 ">
              {equipment.condition}
            </p>

            {equipment.condition && equipment.equipmentId && <p>•</p>}
            <p className="min-w-[0em] truncate text-zinc-300 ">
              {equipment.equipmentId}
            </p>
          </div>
        </div>
        <div className="hidden max-w-[30%] flex-shrink overflow-clip  font-thin sm:flex">
          <p className="w-full truncate text-ellipsis text-center">
            {equipment.description}
          </p>
        </div>
        <div className="flex-shrink items-center justify-end gap-1 text-right">
          <p className="hidden text-xs text-zinc-400 md:block">
            {dayjs(equipment.updatedAt).fromNow()}
          </p>
        </div>
      </Link>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex w-1/12 items-center justify-end rounded-sm bg-transparent p-1 transition-all duration-100 md:w-auto">
            <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="TooltipContent rounded border border-zinc-500 bg-black/50 p-3 py-2 drop-shadow-lg backdrop-blur ">
            <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-500" />

            <div className="hidden md:block">
              <DropdownMenu.Item asChild className="select-none">
                <button
                  className="flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-1 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(
                      `${window.location.origin}/equipment/${equipment.id}`,
                      `Equipment Link`
                    );
                  }}
                >
                  <LinkIcon className="h-5 w-5 text-zinc-200 " />
                  Share Equipment Item
                </button>
              </DropdownMenu.Item>
            </div>
            <div className="block md:hidden">
              <DropdownMenu.Item asChild className="select-none">
                <button
                  className="flex w-full items-center justify-start gap-2 px-1 py-2 transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
                  onClick={(e) => {
                    e.preventDefault();
                    copy(
                      `${window.location.origin}/equipment/${equipment.id}`,
                      `Equipment Link`
                    );
                  }}
                >
                  <LinkIcon className="h-5 w-5 text-zinc-200 " />
                  Share Equipment Item
                </button>
              </DropdownMenu.Item>
            </div>
            <DialogComponent
              title={"Are you sure you want to delete this Equipment Item?"}
              description="If you click yes, this equipment item cannot be recovered."
              yes={() => {
                removeCrewMember(equipment.id);
              }}
              trigger={
                <button className="slideUpAndFade hidden w-full select-none items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white md:flex">
                  <TrashIcon className="h-4 w-4 text-white" />
                  Delete
                </button>
              }
            />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};

const EquipmentLinks: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className ? className : ""}>
      <TooltipComponent content="Add New Equipment" side="bottom">
        <Link
          href="/equipment/new"
          className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700"
        >
          <PlusIcon className="h-6 w-6 text-zinc-100" />
        </Link>
      </TooltipComponent>
      <TooltipComponent content="Download Equipment Spreadsheet" side="bottom">
        <Link
          href="/equipment/download"
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
  );
};

export default EquipmentPage;
