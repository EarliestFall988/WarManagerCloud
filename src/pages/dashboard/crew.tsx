import { ArrowDownTrayIcon, ClipboardDocumentIcon, EllipsisVerticalIcon, FunnelIcon, InboxIcon, PhoneIcon, PlusIcon, TagIcon, TrashIcon } from "@heroicons/react/24/solid";
import { type Tag } from "@prisma/client";
import * as  Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type NextPage } from "next"
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { TagBubble } from "~/components/TagComponent";
import { TagsPopover } from "~/components/TagDropdown";
import { SimpleDropDown } from "~/components/dropdown";
import { LoadingHeader, LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TooltipComponent from "~/components/Tooltip";
import { DashboardMenu } from "~/components/dashboardMenu";
import SignInModal from "~/components/signInPage";
import { useUser } from "@clerk/nextjs";
dayjs.extend(relativeTime);


const CrewMembersPage: NextPage = () => {

    const { user, isSignedIn } = useUser();

    const [crewSearchTerm, setCrewSearchTerm] = useState("");
    const [filterTags, setFilterTags] = useState<Tag[]>([]);

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

    if (!isSignedIn) {
       return <SignInModal redirectUrl="/dashboard/crew" />;
    }

    // if (!user) return <LoadingPage />;

    return (
        <main className="flex min-h-[100vh] bg-zinc-900" >
            <DashboardMenu />
            <div className="w-full">
                <div className="flex w-full items-center justify-between gap-1 p-2 ">
                    <div className="flex w-full gap-1">
                        <input
                            type="search"
                            value={crewSearchTerm}
                            onChange={(e) => setCrewSearchTerm(e.target.value)}
                            placeholder="search crew members by name, or position"
                            className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
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
                    <CrewMemberLinks className="hidden gap-1 sm:flex" />
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
                    <div className="flex h-[85vh] w-full flex-col items-start justify-start gap-1 overflow-y-auto overflow-x-hidden border-t border-zinc-700 p-2 text-gray-100 md:h-[94vh]">
                        {crewData.length > 0 &&
                            crewData?.map((crewMember) => (
                                <div
                                    className="flex w-full cursor-pointer select-none rounded-sm bg-zinc-700 hover:bg-zinc-600 sm:w-10/12 lg:w-full"
                                    key={crewMember.id}
                                >
                                    <Link
                                        href={`/crewmember/${crewMember.id}`}
                                        passHref
                                        className="flex w-11/12 flex-grow items-center gap-1 overflow-x-clip rounded-sm p-1 shadow-sm transition-all duration-100 sm:justify-between"
                                    >
                                        {/* <UserCircleIcon className="hidden h-10 w-10 flex-1 text-zinc-300 md:block" /> */}
                                        <div className="flex w-full flex-col items-start justify-start text-left text-white lg:w-1/3">
                                            <p className="truncate text-xs text-zinc-300 ">
                                                {crewMember.position}
                                            </p>
                                            <div className="flex w-1/2 items-center justify-start gap-1">
                                                <p className="truncate text-lg font-semibold text-white ">
                                                    {crewMember.name}
                                                </p>
                                                {crewMember.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {crewMember.tags.map((tag) => (
                                                            <TagBubble tag={tag} key={tag.id} style="text-xs" />
                                                        ))}
                                                    </div>
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
                                            <span className="text-zinc-400">updated</span>{" "}
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
    );
}


const CrewMemberLinks: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={className ? className : ""}>
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
    );
};

export default CrewMembersPage