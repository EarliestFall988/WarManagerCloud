import { ArrowDownTrayIcon, ClipboardDocumentIcon, EllipsisVerticalIcon, FunnelIcon, PhoneIcon, PlusIcon, TagIcon, TrashIcon } from "@heroicons/react/24/solid";
import { type CrewMember, type Tag } from "@prisma/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type NextPage } from "next"
import Link from "next/link";
import { type FC, useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { TagBubble } from "~/components/TagComponent";
import { TagsPopover } from "~/components/TagDropdown";
import { SimpleDropDown } from "~/components/dropdown";
import { LoadingHeader, LoadingPage2 } from "~/components/loading";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TooltipComponent from "~/components/Tooltip";
import { DashboardMenu } from "~/components/dashboardMenu";
import SignInModal from "~/components/signInPage";
import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DialogComponent } from "~/components/dialog";
dayjs.extend(relativeTime);


const CrewMembersPage: NextPage = () => {

    const { isSignedIn, isLoaded } = useUser();

    const [crewSearchTerm, setCrewSearchTerm] = useState("");
    const [filterTags, setFilterTags] = useState<Tag[]>([]);

    const [animationParent] = useAutoAnimate()

    const getFilterTagIds = useCallback(() => {
        return filterTags.map((tag) => tag.id);
    }, [filterTags]);

    const {
        data: crewData,
        isLoading,
        isError: loadingCrewError,
    } = api.crewMembers.search.useQuery({
        search: crewSearchTerm,
        filter: getFilterTagIds(),
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

    const removeCrewMember = useCallback(
        (id: string) => {

            const timer = setInterval(() => {

                toast.loading("Deleting Crew Member", { duration: 2000 });
                mutate({ crewMemberId: id });
                clearInterval(timer);

            }, 100);
        },
        [mutate]
    );


    if (!isLoaded) {
        return <LoadingPage2 />
    }

    if (!isSignedIn && isLoaded) {
        return <SignInModal redirectUrl="/dashboard/reporting" />;
    }

    return (
        <>
            <Head>
                <title>Crews | War Manager</title>
            </Head>
            <main className="flex min-h-[100vh] bg-zinc-900" >
                <DashboardMenu />
                <div className="w-full">
                    <div className="flex w-full items-center justify-between gap-1 p-2">
                        <div className="flex w-full gap-1">
                            <input
                                type="search"
                                value={crewSearchTerm}
                                onChange={(e) => setCrewSearchTerm(e.target.value)}
                                placeholder="search crew members by name, or position"
                                className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 md:w-3/5"
                            />
                            <TagsPopover
                                type={"crews"}
                                savedTags={filterTags}
                                onSetTags={(e) => setFilterTags(e)}
                            >
                                <button className="flex cursor-pointer items-center justify-center rounded bg-zinc-700 p-2 text-center transition-all duration-100 hover:bg-amber-700">
                                    <FunnelIcon className="h-6 w-6 text-zinc-100" />
                                </button>
                            </TagsPopover>
                        </div>
                        <CrewMemberLinks className="hidden gap-1 md:flex" />
                        <SimpleDropDown
                            trigger={
                                <div className="flex items-center justify-center p-2 md:hidden">
                                    <EllipsisVerticalIcon className="h-6 w-6 text-zinc-100" />
                                </div>
                            }
                        >
                            <CrewMemberLinks className="flex gap-1" />
                        </SimpleDropDown>
                    </div>

                    {isLoading ? (
                        <LoadingHeader loading={isLoading} title="Loading Crew Members" />
                    ) : loadingCrewError || !crewData ? (
                        <div className="flex w-full flex-col items-center justify-center gap-2 rounded p-2">
                            <p className="italic text-red-500">could not load data</p>
                        </div>
                    ) : (
                        <div ref={animationParent} className="flex flex-col items-start justify-start gap-1 border-t border-zinc-700 p-2 text-gray-100">
                            {crewData.length > 0 &&
                                crewData?.map((crewMember) => (
                                    <CrewMemberItem crewMember={crewMember} tags={crewMember.tags} key={crewMember.id} removeCrewMember={(e) => { removeCrewMember(e) }} />
                                    // <div>test</div>
                                ))}
                            {crewData.length === 0 && (
                                <div className="flex w-full flex-col items-center justify-center gap-2">
                                    <p className="text-xl font-bold text-zinc-300">
                                        No Crew Members matching your search
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
            </main>
        </>
    );
}

const CrewMemberItem: FC<{ crewMember: CrewMember, tags: Tag[], removeCrewMember: (id: string) => void }> = ({ crewMember, tags, removeCrewMember }) => {

    const copy = useCallback((text: string, type: string) => {
        void navigator.clipboard.writeText(text);
        toast.success(`${type}Copied to clipboard`);
    }, []);

    return (
        <div
            className="flex w-full cursor-pointer select-none rounded-sm bg-zinc-700 hover:bg-zinc-600"
            key={crewMember.id}
        >
            <Link
                href={`/crewmember/${crewMember.id}`}
                passHref
                className="flex flex-grow items-center gap-1 overflow-x-clip rounded-sm p-1 transition-all duration-100 sm:justify-between"
            >
                {/* <UserCircleIcon className="hidden h-10 w-10 flex-1 text-zinc-300 md:block" /> */}
                <div className="flex md:max-w-[40%] flex-grow flex-col text-left text-white lg:w-1/3">
                    <p className="truncate text-xs text-zinc-300 ">
                        {crewMember.position}
                    </p>
                    <div className="flex w-full items-center justify-start gap-1 ">
                        <p className="truncate text-lg font-semibold text-white ">
                            {crewMember.name}
                        </p>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 ">
                                {tags.map((tag) => (
                                    <TagBubble tag={tag} key={tag.id} style="text-xs" />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1 items-center text-sm">
                        <p className="truncate min-w-[0em] text-zinc-300 ">
                            {crewMember.phone}
                        </p>

                        {crewMember.email && crewMember.phone && (
                            <p>
                                •
                            </p>
                        )}
                        <p className="truncate min-w-[0em] text-zinc-300 ">
                            {crewMember.email}
                        </p>
                    </div>

                </div>
                <div className="hidden overflow-clip font-thin flex-shrink  max-w-[30%] sm:flex">
                    <p className="w-full truncate text-ellipsis text-center">
                        {crewMember.description}
                    </p>
                </div>
                <div className="flex-shrink text-right items-center justify-end gap-1">
                    <p className="hidden text-xs text-zinc-400 md:block">
                        {dayjs(crewMember.updatedAt).fromNow()}
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
                        <DialogComponent title={"Are you sure you want to delete is crew member?"} description="This crew member can not be recovered after you delete them." yes={() => { removeCrewMember(crewMember.id); }} trigger={
                            <button className="slideUpAndFade flex w-full items-center justify-start gap-2 rounded-md p-1 text-red-400 transition-all duration-100 hover:scale-105 hover:bg-red-700/50 hover:text-white">
                                <TrashIcon className="h-4 w-4 text-white" />
                                Delete
                            </button>
                        } />
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    )
}


const CrewMemberLinks: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={className ? className : ""}>
            <TooltipComponent content="Add a New Crew Member" side="bottom">
                <Link
                    href="/crewmember/new"
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
    );
};

export default CrewMembersPage