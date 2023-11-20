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
} from "@heroicons/react/24/solid";
import { useState, useCallback } from "react";
import { TagsPopover } from "~/components/TagDropdown";
import { SimpleDropDown } from "~/components/dropdown";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { Sector, Tag } from "@prisma/client";
import TooltipComponent from "~/components/Tooltip";
import Link from "next/link";

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

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/reporting" />;
  }

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
                placeholder="search crew members by name, or position"
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
        </div>
      </main>
    </>
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
      <TooltipComponent
        content="Download Equipment Spreadsheet"
        side="bottom"
      >
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
