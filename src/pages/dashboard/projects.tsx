import { ArrowDownTrayIcon, ClipboardDocumentIcon, EllipsisVerticalIcon, FunnelIcon, PlusIcon, TagIcon, TrashIcon } from "@heroicons/react/24/solid";
import { type Project, type Tag } from "@prisma/client";
import * as  DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as  Progress from "@radix-ui/react-progress";
import { type NextPage } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { TagBubble } from "~/components/TagComponent";
import { TagsPopover } from "~/components/TagDropdown";
import TooltipComponent from "~/components/Tooltip";
import { SimpleDropDown } from "~/components/dropdown";
import { LoadingHeader, LoadingPage2 } from "~/components/loading";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DashboardMenu } from "~/components/dashboardMenu";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import Head from "next/head";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { DialogComponent } from "~/components/dialog";
dayjs.extend(relativeTime);

const ProjectMenu = () => (
    <>
        <Head>
            <title>Projects | War Manager</title>
        </Head>
        <TooltipComponent content="Add a New Project" side="bottom">
            <Link
                href="/newproject"
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
    const [filterOpen, setFilterOpen] = useState(false);

    const filterToStringArray: string[] = filter.map((tag) => {
        return tag.id;
    });

    const { data, isLoading, isError } = api.projects.search.useQuery({
        search: projectSearchTerm,
        filter: filterToStringArray,
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

    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded) {
        return <LoadingPage2 />
    }

    if (!isSignedIn && isLoaded) {
        return <SignInModal redirectUrl="/dashboard/projects" />;
    }

    return (
        <main className="flex min-h-[100vh] bg-zinc-900">
            <DashboardMenu />
            <div className="w-full" >
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
                            type={"projects"}
                            onSetTags={setFilter}
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

                {(isLoading && (
                    <LoadingHeader loading={isLoading} title={"Loading Projects"} />
                )) ||
                    (isError && (
                        <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-xl font-bold text-zinc-300">
                                Error Loading Projects
                            </p>
                        </div>
                    )) ||
                    (data && data?.length > 0 && (
                        <div className="w-full overflow-y-auto overflow-x-hidden ">
                            <div ref={animateParent} className="flex w-full flex-col gap-1 border-t border-zinc-700 p-2 text-gray-100 ">
                                {data?.map((project, index) => (
                                    <div
                                        key={project.id}
                                        className="w-full select-none rounded-sm bg-zinc-700 hover:bg-zinc-600"
                                    >
                                        <div className="md:1/2 flex items-center gap-1 ">
                                            {/* <WrenchScrewdriverIcon className="hidden h-8 w-8 text-zinc-300 sm:block" /> */}
                                            <Link
                                                href={`/projects/${project.id}`}
                                                passHref
                                                className="flex w-full cursor-pointer items-center gap-1 overflow-hidden rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between"
                                            >
                                                <div className="lg:w-1/2">
                                                    <div className="flex w-full items-center justify-start gap-1 overflow-clip">
                                                        <p className="whitespace-nowrap text-sm font-normal text-zinc-300">
                                                            {project.jobNumber}
                                                        </p>
                                                        <p className="truncate text-ellipsis ">
                                                            {project.name}
                                                        </p>
                                                        {project.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {project.tags.map((tag) => (
                                                                    <TagBubble
                                                                        tag={tag}
                                                                        key={tag.id}
                                                                        style="text-xs"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex w-full items-center justify-start gap-1 overflow-clip text-zinc-300">
                                                        <div className="flex items-center justify-start gap-1 overflow-clip text-xs">
                                                            {/* <MapPinIcon className="h-4 w-4" /> */}
                                                            <p className="block max-w-[7rem] truncate text-left text-sm font-normal italic tracking-tight">
                                                                {project.city.trim()}
                                                                {project.state.trim() && `, ${project.state}`}
                                                            </p>
                                                        </div>
                                                        {project.city && project.state && project.status && <p>·</p>}
                                                        <p className="text-sm">{project.status}</p>
                                                    </div>
                                                </div>
                                                <div className="hidden overflow-clip text-center font-thin flex-shrink  max-w-[30%] lg:flex">
                                                    <p className="w-full truncate text-ellipsis text-center">
                                                        {project.description}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink text-right items-center justify-end gap-1">
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
                                                        {/* <Dialog.Root>
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
                                                                            Are you sure you want to delete this
                                                                            project? This action cannot be undone.
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
                                                        </Dialog.Root> */}

                                                        <DialogComponent title="Delete Project?" description="Are you sure you want to delete the project? After deletion it cannot be recovered." yes={() => { deleteJob(project.id); }} trigger={
                                                            <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                                                                <TrashIcon className="h-5 w-5 text-white" />
                                                                Delete
                                                            </button>
                                                        } />

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
            </div>
            <div className="h-44" />
        </main>
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
    }, []);

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

export default ProjectsPage;