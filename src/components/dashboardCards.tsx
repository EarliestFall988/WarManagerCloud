import { type Sector, type Tag, type Project } from "@prisma/client";
import Link from "next/link";
import { TagBubble } from "./TagComponent";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "react-hot-toast";
import { useCallback, useState, useEffect } from "react";
import {
  ClipboardDocumentIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { DialogComponent } from "./dialog";
import TooltipComponent from "./Tooltip";
import * as Progress from "@radix-ui/react-progress";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const ProjectCard: React.FC<{
  project: Project;
  tags: Tag[];
  sectors: Sector[];
  index: number;
  deleteProject?: (id: string) => void;
}> = ({ project, tags, sectors, index, deleteProject }) => {
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
    <div
      key={project.id}
      className="w-full select-none rounded-sm bg-zinc-700 transition-all duration-100 hover:bg-zinc-600"
    >
      <div className="md:1/2 flex items-center gap-1 ">
        {/* <WrenchScrewdriverIcon className="hidden h-8 w-8 text-zinc-300 sm:block" /> */}
        <Link
          href={`/projects/${project.id}`}
          passHref
          className="flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between"
        >
          <div className="lg:w-1/2">
            <div className="flex items-center justify-start gap-2 text-center font-thin">
              <p className="whitespace-nowrap text-xs font-normal text-zinc-300">
                {project.jobNumber}
              </p>
              {sectors.map((sector) => (
                <p className="rounded-full px-2 text-xs" key={sector.id}>
                  {sector.name}
                </p>
              ))}
            </div>
            <div className="flex w-full items-center justify-start gap-1 overflow-clip">
              <p className="truncate text-ellipsis font-semibold ">
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
            <div className="flex w-full items-center justify-start gap-1 overflow-clip text-zinc-300">
              <div className="flex items-center justify-start gap-1 overflow-clip text-xs">
                {/* <MapPinIcon className="h-4 w-4" /> */}
                <p className="block max-w-[10rem] truncate text-left text-sm font-normal italic tracking-tight">
                  {project.city.trim()}
                  {project.state.trim() && `, ${project.state}`}
                </p>
              </div>
              {project.city && project.state && project.status && <p>·</p>}
              <p className="text-sm">{project.status}</p>
            </div>
          </div>
          <div className="hidden max-w-[30%] flex-shrink overflow-clip text-center  font-thin lg:flex">
            <p className="w-full truncate text-ellipsis text-center">
              {project.description}
            </p>
          </div>
          <div className="flex-shrink items-center justify-end gap-1 text-right">
            <p className="hidden text-xs text-zinc-400 md:block">
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
    <TooltipComponent
      content={`${project.name} is ${progress}% Complete`}
      side="bottom"
    >
      {/* {progress === 0 && <div className="relative overflow-hidden rounded-b-sm bg-zinc-700 w-full h-[4px]">
        </div>
        } */}
      <Progress.Root
        className="relative h-[4px] w-full overflow-hidden rounded-b-sm bg-zinc-700"
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
    </TooltipComponent>
  );
};
