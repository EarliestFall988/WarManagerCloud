import { type Sector, type Tag, type Project } from "@prisma/client";
import Link from "next/link";
import { TagBubble } from "./TagComponent";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "react-hot-toast";
import { useCallback, useState, useEffect, type ReactNode } from "react";
import {
  ArrowPathIcon,
  ChatBubbleBottomCenterIcon,
  CheckBadgeIcon,
  ClipboardDocumentIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { DialogComponent } from "./dialog";
import TooltipComponent from "./Tooltip";
import * as Progress from "@radix-ui/react-progress";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
dayjs.extend(relativeTime);

export const ProjectCard: React.FC<{
  project: Project;
  tags: Tag[];
  sectors: Sector[];
  index: number;
  deleteProject?: (id: string) => void;
}> = ({ project, tags, sectors, index, deleteProject }) => {
  const [projectHistoryOpen, setProjectHistory] = useState(false);

  const copyAddress = useCallback((address: string) => {
    void window.navigator.clipboard.writeText(address);
    toast.success("Address Copied to Clipboard");
  }, []);

  const deleteJob = useCallback(
    (id: string) => {
      if (deleteProject === undefined)
        return toast.error("Error Deleting Project");

      toast.loading("Deleting Project", { duration: 2000 });
      // mutate({ id });
      deleteProject(id);
    },
    [deleteProject]
  );

  return (
    <>
      <div
        key={project.id}
        className="w-full select-none rounded bg-zinc-700 transition-all duration-100 hover:bg-zinc-600 focus:bg-zinc-600"
      >
        <div className="md:1/2 flex items-center gap-1 ">
          {/* <WrenchScrewdriverIcon className="hidden h-8 w-8 text-zinc-300 sm:block" /> */}
          <Link
            href={`/projects/${project.id}`}
            passHref
            className="flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-sm pl-1 pt-1 shadow-sm transition-all duration-100 sm:justify-between"
          >
            <div className="w-11/12 lg:w-1/2">
              <div className="flex items-center justify-start gap-2 text-center font-thin">
                {sectors.map((sector) => (
                  <p
                    className="rounded-full bg-zinc-600 px-1 text-xs tracking-tight"
                    key={sector.id}
                  >
                    {sector.name}
                  </p>
                ))}
                <p className="whitespace-nowrap text-xs font-normal text-zinc-300">
                  {project.jobNumber}
                </p>
              </div>
              <div className="flex w-full items-center justify-start gap-1 overflow-clip">
                <p className=" w-[40vw] truncate text-ellipsis font-semibold md:w-full ">
                  {project.name}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <TagBubble tag={tag} key={tag.id} style="text-xs" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex w-full items-end justify-start gap-1 overflow-clip text-zinc-300">
                {project.status.trim().toLowerCase() !== "legal" &&
                !project.status.toLowerCase().includes("bad") ? (
                  project.status.toLowerCase().trim() === "100% complete" ? (
                    <p className="max-w-[20vw] truncate text-sm text-green-400">
                      {project.status}
                    </p>
                  ) : (
                    <p className="max-w-[20vw] truncate text-sm">
                      {project.status}
                    </p>
                  )
                ) : (
                  <div className="max-w-[20vw] truncate rounded-full bg-red-700 px-1 text-sm font-medium">
                    {project.status}
                  </div>
                )}
                {project.city && project.state && project.status && <p>·</p>}
                <div className="flex items-center justify-start gap-1 overflow-clip text-xs">
                  {/* <MapPinIcon className="h-4 w-4" /> */}
                  <p className="block max-w-[10rem] truncate text-left text-sm font-normal tracking-tight lg:max-w-[20rem]">
                    {project.city.trim()}
                    {project.state.trim() && `, ${project.state}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden w-[30%] flex-shrink overflow-clip font-thin lg:flex">
              <p className="w-full truncate text-ellipsis text-left">
                {project.description}
              </p>
            </div>
            <div className="flex-shrink items-center justify-end gap-1 text-right">
              <p className="hidden text-xs text-zinc-400 md:block">
                {dayjs(project.updatedAt).fromNow()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setProjectHistory(!projectHistoryOpen);
              }}
              className="flex items-center justify-center gap-2 rounded-lg p-3 py-4 text-zinc-200 hover:text-amber-600"
            >
              <ChatBubbleBottomCenterIcon className="h-5 w-5" />
            </button>
          </Link>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1">
                <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="TooltipContent w-44 rounded border border-zinc-500 bg-black/60 p-3 py-2 drop-shadow-lg backdrop-blur ">
                <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-500" />
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
                {deleteProject && (
                  <DialogComponent
                    title="Delete Project?"
                    description="Are you sure you want to delete the project? After deletion it cannot be recovered."
                    yes={() => {
                      deleteJob(project.id);
                    }}
                    trigger={
                      <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                        <TrashIcon className="h-5 w-5 text-white" />
                        Delete
                      </button>
                    }
                  />
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <ProjectProgress project={project} index={index} />
      </div>
      {projectHistoryOpen && (
        <div className="-my-1 flex flex-col items-center justify-center pb-5 lg:items-start lg:pl-4">
          <div className="w-11/12 border-l border-neutral-700 p-2 lg:w-2/3">
            <TimelineContainer>
              <textarea
                placeholder="Update others on project progress... "
                className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 transition-all duration-100 hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
              {/* <button className="flex gap-2 rounded bg-amber-700 p-2">
              <p>Send</p>
              <PaperAirplaneIcon className="h-5 w-5 text-zinc-200" />
            </button> */}
            </TimelineContainer>
            <TimelineContainer>
              <textarea
                placeholder="Update others on project progress... "
                className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 transition-all duration-100 hover:border-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
              <button className="flex gap-2 rounded bg-amber-700 p-2">
                <p>Send</p>
                <PaperAirplaneIcon className="h-5 w-5 text-zinc-200" />
              </button>
            </TimelineContainer>
          </div>
        </div>
      )}
    </>
  );
};

const TimelineContainer: React.FC<{
  children: ReactNode;
  lastUpdateTime?: Date;
}> = ({ children, lastUpdateTime }) => {
  return (
    <div className="flex w-full items-start pb-5">
      <div className="h-2 w-2 -translate-x-3 translate-y-2 rounded-full bg-zinc-500" />
      <div className="w-full">
        <div className="flex gap-1 text-zinc-500">
          <p>You</p>
          <p>|</p>
          {lastUpdateTime && <p>{dayjs(lastUpdateTime).fromNow()}</p>}
          {!lastUpdateTime && <p>Right Now</p>}
        </div>
        <div className="flex flex-col items-end gap-2">{children}</div>
      </div>
    </div>
  );
};

const ProjectProgress: React.FC<{ project: Project; index: number }> = ({
  project,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setProgress(project.percentComplete),
      500 // * (index / 3) + 500
    );
    return () => clearTimeout(timer);
  }, [project.percentComplete]);

  return (
    <Progress.Root
      className="relative h-[2px] w-full overflow-hidden rounded-b-sm"
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: "translateZ(0)",
      }}
      value={progress}
    >
      <Progress.Indicator
        style={{ transform: `translateX(-${100 - progress}%)` }}
        className="ease-[cubic-bezier(0.65, 0, 0.35,  1)]  h-full w-full rounded-md bg-gradient-to-r from-orange-600 to-amber-700 transition-transform duration-[660ms]"
      />
    </Progress.Root>
  );
};

export const BlueprintListItem: React.FC<{
  id: string;
  pinned: boolean;
  name: string;
  description: string;
  updatedAt: Date;
  userEmail: string | undefined;
  liveData: boolean;
}> = ({ id, name, pinned, description, updatedAt, userEmail, liveData }) => {
  const copy = (text: string, type: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const [isPinned, setIsPinned] = useState<"pinning" | "unpinning" | "unknown">(
    "unknown"
  );

  const blueprintContext = api.useContext().blueprints;

  const { mutate: deleteBlueprint } = api.blueprints.delete.useMutation({
    onSuccess: () => {
      toast.success(`${name} deleted`);
      void blueprintContext.invalidate();
    },

    onError: (e) => {
      console.log(e);
      toast.error("Something went wrong");
    },
  });

  const { mutate } = api.blueprints.setBlueprintPined.useMutation({
    onSuccess: () => {
      toast.success(
        isPinned === "pinning" ? `${name} Pinned` : `${name} unpinned`
      );
      setIsPinned("unknown");
      void blueprintContext.invalidate();
    },

    onError: (error) => {
      console.log(error);
      toast.error("Something went wrong");
    },
  });

  const toggleBlueprintPinned = useCallback(
    (id: string, blueprintPinned: boolean) => {
      setIsPinned(blueprintPinned ? "pinning" : "unpinning");

      mutate({ blueprintId: id, isPinned: blueprintPinned });
    },
    [mutate]
  );

  return (
    <div
      key={id}
      className="flex w-full select-none items-center justify-between gap-1 rounded-sm  bg-zinc-700 transition-all duration-100 hover:bg-zinc-600"
    >
      <Link
        href={`/blueprints/${id}`}
        passHref
        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded-sm p-2 "
      >
        <div className="w-3/2 tracking-tight md:w-3/5">
          <div className="flex items-center justify-start gap-1">
            {pinned && (
              <div className="flex items-center justify-start gap-1">
                <TooltipComponent content="Pinned" side="bottom">
                  <FlagIcon className="h-3 w-3 text-amber-500" />
                </TooltipComponent>
              </div>
            )}
            <div className="flex items-center gap-1 truncate text-left text-lg font-semibold tracking-tight">
              <p className="w-full truncate">{name}</p>
              {liveData && (
                <TooltipComponent
                  content="This blueprint is evaluated for scheduling conflicts with other blueprints."
                  side="bottom"
                >
                  <CheckBadgeIcon className="h-4 w-4 text-zinc-400" />
                </TooltipComponent>
              )}
              {!liveData && (
                <TooltipComponent
                  content="This blueprint is not evaluated for scheduling conflicts with other blueprints."
                  side="bottom"
                >
                  <PaintBrushIcon className="h-4 w-4 text-zinc-400" />
                </TooltipComponent>
              )}
            </div>
          </div>
          {userEmail && (
            <div className="flex items-start justify-start gap-1 font-normal text-zinc-300">
              <p className="truncate text-sm">{userEmail}</p>
            </div>
          )}
        </div>
        <div className="hidden font-thin md:flex md:w-1/2 ">
          <p className="w-full truncate text-ellipsis text-center">
            {description}
          </p>
        </div>
        <p className="w-1/4 truncate text-right text-xs text-zinc-300">
          {dayjs(updatedAt).fromNow()}
        </p>
      </Link>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex w-1/12 select-none items-center justify-end rounded-sm bg-transparent p-1 outline-none transition-all duration-100 md:w-auto">
            <EllipsisVerticalIcon className="h-6 w-6 text-zinc-300 " />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="TooltipContent w-44 rounded border border-zinc-500 bg-black/50 p-3 py-2 drop-shadow-lg backdrop-blur ">
            <DropdownMenu.DropdownMenuArrow className="fill-current text-zinc-500" />
            <DropdownMenu.Item
              className="selection-none flex items-center justify-start gap-2 border-b border-zinc-600 p-1 outline-none transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
              onClick={(e) => {
                e.preventDefault();
                copy(
                  `${window.location.origin}/blueprints/${id}`,
                  "Blueprint Link "
                );
              }}
            >
              <ClipboardDocumentIcon className="h-5 w-5 text-zinc-200 " />
              Copy Link
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="selection-none flex items-center justify-start gap-2 border-b border-zinc-600 p-1 outline-none transition-all duration-100 hover:scale-105 hover:rounded-md hover:border-transparent hover:bg-zinc-700"
              onClick={(e) => {
                e.preventDefault();
                toggleBlueprintPinned(id, !pinned);
              }}
              disabled={isPinned === "pinning" || isPinned === "unpinning"}
            >
              {isPinned === "unknown" && (
                <>
                  <FlagIcon className="h-5 w-5 text-zinc-200" />
                  {pinned ? <p>Unpin</p> : <p>Pin</p>}
                </>
              )}
              {isPinned === "pinning" && (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-zinc-200" />
                  <p>Pinning...</p>
                </>
              )}
              {isPinned === "unpinning" && (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin text-zinc-200" />
                  <p>Unpinning...</p>
                </>
              )}
            </DropdownMenu.Item>
            <DialogComponent
              title={"Are you sure you want to delete this blueprint?"}
              description="If you click yes, it cannot be recovered."
              yes={() => {
                toast.loading("Deleting blueprint...", { duration: 3000 });
                deleteBlueprint({ blueprintId: id });
              }}
              trigger={
                <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
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
