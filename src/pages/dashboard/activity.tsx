import { useUser } from "@clerk/nextjs";
import {
  ArrowDownTrayIcon,
  ArrowLongUpIcon,
  ArrowPathRoundedSquareIcon,
  ArrowUpRightIcon,
  ChatBubbleLeftEllipsisIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  HandThumbUpIcon,
  MegaphoneIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PencilSquareIcon,
  PhoneIcon,
  SparklesIcon,
  Square2StackIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, {  useCallback, useMemo, useState } from "react";
import { DashboardMenu } from "~/components/dashboardMenu";

import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { type DropdownTagType } from "~/components/TagDropdown";
import Select, { type MultiValue } from "react-select";
import { InputComponent, TextareaComponent } from "~/components/input";
import { useRouter } from "next/router";
import TooltipComponent from "~/components/Tooltip";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { utils, writeFileXLSX } from "xlsx";
import {
  DialogComponentManualOpenClose,
  EditModalComponent,
} from "~/components/dialog";
import { type LogReaction, type LogReply } from "@prisma/client";
import * as Popover from "@radix-ui/react-popover";
import Linkify from "linkify-react";

dayjs.extend(relativeTime);

const RecentActivityPage: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isClearFilters, setClearfilters] = useState<boolean>(false);

  const toggleFilter = useCallback(() => {
    setIsFilterVisible((prev) => !prev);
  }, []);

  const [filter, setFilter] = useState<DropdownTagType[]>([]);
  const [search, setSearch] = useState<string>("");
  const [announcementCount, setAnnouncementCount] = useState<number>(0);
  // const [page, setPage] = useState<number>(1);
  // const [pageSize, setPageSize] = useState<number>(10);
  // const [sort, setSort] = useState<string>("createdAt:DESC");

  const context = api.useContext().logs;

  const {
    data,
    isLoading: loadingData,
    isError: errorLoadingData,
  } = api.logs.Search.useQuery({
    filter: filter.map((f) => f.value),
    search,
  });

  const [animationParent] = useAutoAnimate();

  const DownloadLogXLSX = React.useCallback(() => {
    if (!data) return;

    const json = data.map((log) => {
      let link = log.url;

      if (log.action == "url") {
        link = window.location.protocol + "//" + window.location.host + log.url;
      }

      return {
        Id: log.id,
        Name: log.name,
        Description: log.description,
        "Time (UTC)": log.updatedAt,
        Category: log.category,
        Severity: log.severity,
        Action: log.action,
        Data: JSON.stringify(log.data) || "{}",
        Link: link,
        user: log.user?.email || "<unknown>",
      };
    });

    const ws = utils.json_to_sheet(json);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Logs");

    const date = new Date().toUTCString();

    writeFileXLSX(wb, `Activity Logs ${date}.xlsx`);
  }, [data]);

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/activity" />;
  }

  const clear = () => {
    setFilter([]);
    setSearch("");
    setClearfilters(true);
  };

  const refresh = () => {
    void context.invalidate();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="flex min-h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="w-full">
        <div className="fixed top-0 z-10 w-full bg-zinc-900/80 p-2 backdrop-blur md:w-[94%] lg:w-[96%]">
          <div className="flex items-center justify-between">
            <h1 className="select-none p-2 text-2xl font-semibold">Timeline</h1>
            <div className="flex gap-2">
              <TooltipComponent content="Refresh" side="bottom">
                <button
                  className="text-200 flex gap-2 rounded bg-zinc-800 p-1"
                  onClick={refresh}
                >
                  <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
              <TooltipComponent
                content="Download Logs (with selected filters)"
                side="bottom"
              >
                <button
                  className="text-200 flex gap-2 rounded bg-zinc-800 p-1"
                  onClick={DownloadLogXLSX}
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
              <div className="block lg:hidden">
                <button
                  className="text-200 flex gap-2 rounded bg-zinc-800 p-1"
                  onClick={toggleFilter}
                >
                  <FunnelIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <InputComponent
              placeholder="search"
              autoFocus
              onChange={(e) => setSearch(e.currentTarget.value)}
              value={search}
              disabled={false}
            />
            <FilterAndSearch
              setClearFilters={() => {
                setClearfilters(false);
              }}
              onClose={() => {
                setIsFilterVisible(false);
              }}
              clearFilters={isClearFilters}
              visible={isFilterVisible}
              onFilter={setFilter}
            />
          </div>
        </div>

        {loadingData && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <LoadingSpinner />
          </div>
        )}
        {!loadingData && !errorLoadingData && data && data?.length > 0 && (
          <>
            <div className="h-32 lg:h-48" />
            <ActivityTopButtons refresh={refresh} />
            <div
              ref={animationParent}
              className="m-auto flex flex-col rounded-sm border-zinc-700 sm:w-full lg:w-[50vw]"
            >
              {data.length > 0 &&
                data?.map((log) => {
                  return (
                    <ActivityListItem
                      key={log.id}
                      id={log.id}
                      severity={log.severity}
                      profileURl={log.user?.profilePicture || ""}
                      description={log.description}
                      category={log.category}
                      name={log.name}
                      author={log.user?.email || "unknown"}
                      link={log.url}
                      action={log.action}
                      actionTime={log.updatedAt || log.createdAt}
                      editedMessage={log.editedMessage}
                      reactions={log.logReactions}
                      count={log._count}
                    />
                  );
                })}
            </div>
            <div className="flex select-none flex-col items-center justify-center gap-4 p-5 text-zinc-600">
              <p>End of Timeline</p>
              <TooltipComponent content="Scroll To Top" side="top">
                <button
                  className="flex gap-2 rounded p-1 text-zinc-500 transition-all duration-100 hover:scale-110 hover:text-zinc-300"
                  onClick={scrollToTop}
                >
                  <ArrowLongUpIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
            </div>
            <div className="h-36" />
          </>
        )}
        {data?.length === 0 && !loadingData && (
          <div className="flex h-full w-full select-none items-center justify-center gap-2 p-4 text-zinc-400">
            <div
              className={`flex gap-2 ${
                filter.length > 0 || search.trim().length > 0
                  ? "border-r border-zinc-600 p-2"
                  : ""
              }`}
            >
              <p className="select-none text-lg text-zinc-300">
                No Activity Found
              </p>
              <SparklesIcon className="h-6 w-6" />
            </div>
            {(filter.length > 0 || search.trim().length > 0) && (
              <>
                <button
                  onClick={clear}
                  className="text-zinc-500 transition-colors duration-200 ease-in-out hover:text-amber-400"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}
        {errorLoadingData && (
          <div className="flex h-full w-full select-none items-center justify-center gap-2 p-4 text-red-500">
            <p className="select-none text-lg font-semibold text-red-400">
              Error Loading Activity
            </p>
            <ExclamationTriangleIcon className="h-6 w-6 rotate-6" />
          </div>
        )}
      </div>
    </main>
  );
};

const ActivityTopButtons: React.FC<{ refresh: () => void }> = ({ refresh }) => {
  const [isAnnouncementInputVisible, setIsAnnouncementInputVisible] =
    useState(false);

  const [message, setMessage] = useState("");

  const { mutate, isLoading } = api.logs.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement created");
      setIsAnnouncementInputVisible(false);
      setMessage("");
      refresh();
    },
    onError: (error) => {
      console.log(error);
      toast.error("Error creating announcement");
    },
  });

  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "<unknown email>";

  const ToggleMessageInput = useCallback(() => {
    setIsAnnouncementInputVisible((prev) => !prev);
  }, []);

  const postMessage = useCallback(() => {
    if (message.trim().length > 0) {
      toast.loading("Sending message...", { duration: 3000 });

      mutate({
        description: message,
        category: "announcement",
        severity: "info",
        action: "",
        name: `Announcement from ${userEmail}`,
        url: "",
      });
    } else {
      toast.error("Please enter a message");
    }
  }, [message, mutate, userEmail]);

  const [animationParent] = useAutoAnimate();
  return (
    <>
      <div className="m-auto flex items-center justify-end p-2 sm:w-full lg:w-[50vw]">
        <TooltipComponent content="Create Message" side="top">
          <button
            className="flex rounded p-1 text-zinc-500 transition-all duration-100 hover:scale-110 hover:text-zinc-300"
            onClick={() => {
              ToggleMessageInput();
            }}
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        <TooltipComponent content="Refresh" side="top">
          <button
            className="flex gap-2 rounded p-1 text-zinc-500 transition-all duration-100 hover:scale-110 hover:text-zinc-300"
            onClick={refresh}
          >
            <ArrowPathRoundedSquareIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
      </div>
      <div ref={animationParent}>
        {isAnnouncementInputVisible && (
          <div className="m-auto h-[25vh] p-1 sm:w-full lg:w-[50vw]">
            <div className="flex gap-2">
              <p className="pb-1 text-sm text-zinc-500">{userEmail}</p>
              <p className="pb-1 text-sm text-zinc-500">{"|"}</p>
              <p className="pb-1 text-sm text-zinc-500">
                {dayjs(Date.now()).fromNow()}
              </p>
            </div>
            <TextareaComponent
              autoFocus
              error=""
              placeholder="What's on your mind?"
              disabled={false}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <div className="flex select-none justify-end">
              <button
                onClick={postMessage}
                className="flex items-center justify-center gap-1 rounded bg-amber-700 p-2 font-semibold outline-none transition duration-100 hover:bg-amber-500 focus:bg-amber-500 "
              >
                {isLoading && <LoadingSpinner />}
                {!isLoading && (
                  <>
                    <p>Send</p>
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const FilterAndSearch: React.FC<{
  visible: boolean;
  clearFilters: boolean;
  setClearFilters: () => void;
  onClose: () => void;
  onFilter: (tags: DropdownTagType[]) => void;
}> = ({ visible, onClose, setClearFilters, clearFilters, onFilter }) => {
  return (
    <>
      <div
        className={`flex flex-wrap justify-between gap-2 lg:hidden lg:flex-nowrap lg:gap-11 ${
          visible ? "border border-zinc-500 bg-zinc-800 p-1" : ""
        } rounded`}
      >
        {visible && (
          <>
            <MultiSelectDropdown
              setclearFilters={setClearFilters}
              clearFilters={clearFilters}
              onSetTags={onFilter}
              selectedTags={[]}
              placeholder="Filter By Log Severity, Category, and User"
            />
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded bg-red-900/30 p-1"
            >
              <XMarkIcon className="h-6 w-6 text-red-400" />
            </button>
          </>
        )}
      </div>
      <div className="hidden flex-wrap justify-between gap-2 lg:flex lg:flex-nowrap lg:gap-11">
        <MultiSelectDropdown
          setclearFilters={setClearFilters}
          clearFilters={clearFilters}
          onSetTags={onFilter}
          selectedTags={[]}
          placeholder="Filter By Log Severity and Category"
        />
      </div>
    </>
  );
};

export const MultiSelectDropdown: React.FC<{
  selectedTags: DropdownTagType[];
  setclearFilters: () => void;
  placeholder?: string;
  clearFilters: boolean;
  onSetTags: (tags: DropdownTagType[]) => void;
}> = ({
  selectedTags,
  setclearFilters,
  clearFilters,
  onSetTags,
  placeholder,
}) => {
  const [allTags, setAllTags] = useState<DropdownTagType[]>([]);
  const [currentTags, setCurrentTags] = useState<DropdownTagType[]>([]);

  const {
    data: users,
    isLoading: loadingUsers,
    isError: errorLoadingUsers,
  } = api.users.getAllUsers.useQuery();

  const onChange = useCallback(
    (
      e: MultiValue<{
        value: string;
        label: string;
        color: string;
      }>
    ) => {
      const tags = [] as DropdownTagType[];

      if (!allTags) return;

      e.forEach((tg) => {
        const tag = allTags.find((t) => t.value === tg.value);

        if (tag) {
          tags.push(tag);
        }
      });

      onSetTags(tags);
      setCurrentTags(tags);

      setclearFilters();
    },
    [allTags, onSetTags, setclearFilters]
  );

  useMemo(() => {
    const baseTags = [
      {
        value: "severity:moderate",
        label: "Moderate Severity",
        color: "gray",
      },
      {
        value: "severity:critical",
        label: "Critical Severity",
        color: "gray",
      },
      {
        value: "severity:info",
        label: "Info Severity",
        color: "gray",
      },
      {
        value: "category:blueprint",
        label: "Blueprints",
        color: "gray",
      },
      {
        value: "category:crew",
        label: "Crew Members",
        color: "gray",
      },
      {
        value: "category:project",
        label: "Projects",
        color: "gray",
      },
      {
        value: "category:schedule",
        label: "Schedules",
        color: "gray",
      },
    ] as DropdownTagType[];

    setAllTags(baseTags);

    if (users != null && !loadingUsers && !errorLoadingUsers) {
      users.forEach((user) => {
        const email = user?.User?.emailAddresses[0]?.emailAddress;

        if (email) {
          baseTags.push({
            value: `user:${user.User.id}`,
            label: email,
            color: "gray",
          });
        }
      });
    }

    setAllTags(baseTags);
  }, [users, loadingUsers, errorLoadingUsers]);

  useMemo(() => {
    if (clearFilters) {
      onChange([]);
    }
  }, [clearFilters, onChange]);

  return (
    <Select
      closeMenuOnSelect={false}
      defaultValue={selectedTags}
      isMulti
      name="currentTags"
      options={allTags}
      value={currentTags}
      classNamePrefix="select"
      className="w-full rounded bg-zinc-800 text-zinc-300 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
      onChange={(e) => {
        onChange(e);
      }}
      unstyled
      placeholder={placeholder || "add..."}
      classNames={{
        valueContainer(props) {
          return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${
            props.selectProps.classNamePrefix
              ? props.selectProps.classNamePrefix + "-value-container"
              : ""
          }`;
        },
        multiValue() {
          return `text-zinc-300 border border-zinc-300 px-2 rounded-xl px-1 flex items-center text-sm`;
        },
        container({ isFocused }) {
          return `w-full bg-zinc-800 rounded ${
            isFocused
              ? "ring-2 ring-amber-700"
              : "hover:ring-zinc-600 hover:ring-2"
          } `;
        },
        menuList() {
          return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
        },
        option() {
          return `hover:bg-zinc-700 hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
        },
      }}
    />
  );
};

type activityListItemType = {
  action: string;
  description: string;
  severity: string;
  profileURl: string;
  category: string;
  name: string;
  author: string;
  link: string;
  actionTime: Date;
  id: string;
  editedMessage?: string | undefined | null;
  reactions: LogReaction[];
  count: {
    logReactions: number;
    logReplys: number;
  };
};

const ActivityListItem: React.FC<activityListItemType> = ({
  action,
  severity,
  profileURl,
  description,
  name,
  author,
  link,
  actionTime,
  id,
  category,
  editedMessage,
  reactions,
  count,
}) => {
  const Copy = (url: string) => {
    void window.navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const router = useRouter();
  const { user } = useUser();

  const [showEdit, setShowEdit] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [myReaction, setMyReaction] = useState<LogReaction | null>(null);
  const [logDrawerOpen, setLogDrawerOpen] = useState(false);

  const [reactionCount, setReactionCount] = useState(count.logReactions);
  const [replyCount, setReplyCount] = useState(count.logReplys);

  const [animationParent] = useAutoAnimate();

  const logsUpdateContext = api.useContext().logs;
  const reactionContext = api.useContext().reactions;
  const context = api.useContext();

  useMemo(() => {
    const reaction = reactions.find((r) => r.authorId === user?.id);

    if (reaction) {
      setMyReaction(reaction);
    }
  }, [reactions, user?.id]);

  const { mutate: editMessage, isLoading } = api.logs.updateMessage.useMutation(
    {
      onSuccess: () => {
        toast.success("Message updated");
        setShowEdit(false);
        void logsUpdateContext.invalidate();
        void context.invalidate();
      },

      onError: (err) => {
        console.log(err);
        toast.error("Something went wrong");
      },
    }
  );

  const { mutate, isLoading: creating } =
    api.reactions.createReaction.useMutation({
      onSuccess: (e) => {
        setMyReaction(e);
        void reactionContext.invalidate();
        void context.invalidate();
      },
      onError: (err) => {
        console.log(err);
        toast.error("Something went wrong");
        void reactionContext.invalidate();
        void logsUpdateContext.invalidate();
      },
    });

  const { mutate: deleteReaction, isLoading: deleting } =
    api.reactions.deleteReaction.useMutation({
      onError: (err) => {
        console.log(err);
        toast.error("Something went wrong");
        void reactionContext.invalidate();
        void logsUpdateContext.invalidate();
      },
    });

  const setEditMessage = useCallback(
    (message: string) => {
      editMessage({ id, message });
    },
    [id, editMessage]
  );

  const createReaction = (reaction: string) => {
    setShowReactions(false);

    if (!myReaction) {
      setReactionCount(reactionCount + 1);
      setMyReaction({
        authorId: user?.id || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "",
        reaction,
      });
    }

    if (myReaction?.reaction === reaction) {
      removeMyReaction();
      return;
    }

    if (myReaction !== undefined && myReaction !== null) {
      myReaction.reaction = reaction;
    }

    mutate({ logId: id, reaction });
  };

  const removeMyReaction = () => {
    setShowReactions(false);

    if (myReaction) {
      setMyReaction(null);
      const count = reactionCount - 1;
      if (count >= 0) {
        setReactionCount(reactionCount - 1);
      }
      deleteReaction({ id: myReaction.id });
    }
  };

  const incrementReplyCount = () => {
    setReplyCount(replyCount + 1);
  };

  return (
    <div
      className={`flex flex-col   ${
        severity === "critical" && category !== "announcement"
          ? "bg-gradient-to-l from-amber-800/30"
          : ""
      } ${
        category === "announcement"
          ? "my-2 rounded-lg border border-t border-zinc-600 bg-zinc-600/30"
          : "border-x border-t border-zinc-700"
      } `}
      id={`activity-${id}`}
    >
      <button
        onClick={() => {
          setLogDrawerOpen(!logDrawerOpen);
        }}
        className="flex h-full w-full items-start justify-start gap-2 p-2"
      >
        <div className="hidden flex-shrink-0 pt-1 md:block">
          <Image
            src={profileURl}
            className="h-12 w-12 flex-shrink-0 select-none rounded-full"
            width={48}
            height={48}
            alt={`${author}'s profile picture`}
          />
        </div>
        <div className="block h-10 w-10 flex-shrink-0 pt-1 md:hidden">
          <Image
            src={profileURl}
            className="h-10 w-10 select-none rounded-full"
            width={32}
            height={32}
            alt={`${author}'s profile picture`}
          />
        </div>
        <div className={"flex h-full w-full flex-col justify-between truncate"}>
          <div className="flex flex-col items-start justify-start truncate pb-2">
            <TooltipComponent content="View Log" side="right">
              <Link
                href={`/log/${id}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 hover:bg-zinc-700/50"
              >
                {(severity === "critical" || severity === "moderate") && (
                  <div className="block md:hidden">
                    {severity === "critical" && (
                      <ExclamationTriangleIcon className="h-4 w-4 select-none text-yellow-500" />
                    )}
                    {severity === "moderate" && (
                      <MegaphoneIcon className="h-4 w-4 text-blue-300" />
                    )}
                  </div>
                )}
                <p className="text-sm text-zinc-500">{author}</p>
                <p className="text-sm text-zinc-500">|</p>
                <p className="text-sm text-zinc-500">
                  {dayjs(actionTime).fromNow()}
                </p>
              </Link>
            </TooltipComponent>
            <div className="flex items-center justify-start gap-1">
              <p
                className={`pb-1 text-lg font-semibold ${
                  category === "announcement" ? "hidden" : ""
                }`}
              >
                {name}
              </p>
              {severity === "critical" && (
                <div className="hidden items-center gap-1 md:flex">
                  <ExclamationTriangleIcon className="h-4 w-4 select-none text-yellow-500" />
                  <p className="select-none text-xs text-yellow-500">
                    Critical
                  </p>
                </div>
              )}
              {severity === "moderate" && (
                <div className="hidden select-none items-center gap-1 md:flex">
                  <MegaphoneIcon className="h-4 w-4 text-blue-300" />
                  <p className="text-xs text-blue-300">Moderate</p>
                </div>
              )}
            </div>
            <div
              className={`w-full whitespace-pre-wrap text-left ${
                category === "announcement" ? "text-md" : "text-sm"
              }`}
            >
              <p className="text-left">
                <MessageComponent data={description} />
                {editedMessage && (
                  <TooltipComponent
                    content={`${editedMessage ? editedMessage : ""}`}
                    side="top"
                  >
                    <span className="text-xs text-zinc-400">
                      {editedMessage && `(edited)`}
                    </span>
                  </TooltipComponent>
                )}
              </p>
            </div>
          </div>
        </div>
      </button>
      <div className="flex select-none justify-start gap-2 pl-16">
        {
          <Popover.Root
            defaultOpen={false}
            onOpenChange={(e) => setShowReactions(e)}
            open={showReactions}
          >
            <Popover.Trigger
              onClick={(e) => {
                e.preventDefault();
                console.log("clicked reaction button");
                setShowReactions(!showReactions);
              }}
            >
              <div
                className={`flex cursor-pointer items-center gap-1 rounded p-1 transition-all duration-100 hover:bg-zinc-800 ${
                  myReaction?.reaction ? "text-amber-600" : "text-zinc-400"
                }`}
              >
                <TooltipComponent
                  content={`React to this ${
                    category === "announcement" ? "message" : "log"
                  }`}
                  side="top"
                >
                  <>
                    <p className="text-sm">{reactionCount}</p>
                    <HandThumbUpIcon className="h-4 w-4 " />
                  </>
                </TooltipComponent>
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="w-[260px] rounded border border-zinc-500 bg-black/70 p-1 shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] backdrop-blur will-change-[transform,opacity] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.violet7)] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
                sideOffset={2}
              >
                {deleting || creating ? (
                  <div className="flex w-full items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 text-2xl">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          createReaction("👍");
                        }}
                        className={`rounded p-1 transition duration-200 hover:scale-110 ${
                          myReaction?.reaction === "👍" ? "opacity-50" : ""
                        }`}
                      >
                        <p>👍</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          createReaction("❤️");
                        }}
                        className={`rounded p-1 transition duration-200 hover:scale-110 ${
                          myReaction?.reaction === "❤️" ? "opacity-50" : ""
                        }`}
                      >
                        <p>❤️</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          createReaction("🚀");
                        }}
                        className={`rounded p-1 transition duration-200 hover:scale-110 ${
                          myReaction?.reaction === "🚀" ? "opacity-50" : ""
                        }`}
                      >
                        <p>🚀</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          createReaction("🔥");
                        }}
                        className={`rounded p-1 transition duration-200 hover:scale-110 ${
                          myReaction?.reaction === "🔥" ? "opacity-50" : ""
                        }`}
                      >
                        <p>🔥</p>
                      </button>
                    </div>
                    {myReaction && (
                      <div className="flex w-full justify-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeMyReaction();
                          }}
                          className={`w-full rounded p-1 text-zinc-300 transition duration-200 hover:bg-red-800 hover:text-white`}
                        >
                          <p>Remove {myReaction.reaction}</p>
                        </button>
                      </div>
                    )}
                  </>
                )}
                <Popover.Arrow className="fill-zinc-500" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        }
        {
          <TooltipComponent
            content={`Message ${
              replyCount === 0 ? "User" : "Users in This Thread"
            }`}
            side="top"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                setLogDrawerOpen(!logDrawerOpen);
              }}
              className="flex cursor-pointer items-center gap-1 rounded p-1 text-zinc-400 transition-all duration-100 hover:bg-zinc-800"
            >
              <p className="text-sm ">{replyCount}</p>
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
            </button>
          </TooltipComponent>
        }
        {category === "announcement" &&
          user?.emailAddresses[0]?.emailAddress === author && (
            <EditModalComponent
              title="Edit Message"
              messageToEdit={description}
              open={showEdit}
              yes={(e) => {
                setEditMessage(e);
              }}
              cancel={() => {
                setShowEdit(false);
              }}
              loading={isLoading}
              trigger={
                <TooltipComponent content={`Edit Message`} side="top">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEdit(true);
                    }}
                  >
                    <div className="flex cursor-pointer items-center gap-1 rounded p-1 text-zinc-400 transition-all duration-100 hover:bg-zinc-800">
                      <PencilIcon className="h-4 w-4 " />
                    </div>
                  </button>
                </TooltipComponent>
              }
            />
          )}
        {(action === "url" || action === "external url") && (
          <button
            onClick={(e) => {
              void router.push(link);
              e.preventDefault();
            }}
            className="flex cursor-pointer items-center gap-1 rounded p-1 text-zinc-400 transition-all duration-100 hover:bg-zinc-800"
          >
            <p className="text-sm ">View Changes</p>
            <ArrowUpRightIcon className="h-4 w-4" />
          </button>
        )}
        {/* {
              <button
                onClick={(e) => {
                  Copy(author);
                  e.preventDefault();
                }}
                className="flex cursor-pointer items-center gap-1 rounded p-1 transition-all duration-100 hover:bg-zinc-800"
              >
                <p className="text-sm text-zinc-200">{"Copy Author's Email"}</p>
                <Square2StackIcon className="h-4 w-4 text-zinc-400" />
              </button>
            } */}
        {action === "external url" && (
          <button
            onClick={(e) => {
              Copy(link);
              e.preventDefault();
            }}
            className="flex cursor-pointer items-center gap-1 rounded p-1 transition-all duration-100 hover:bg-zinc-800"
          >
            <p className="text-sm text-zinc-200">Copy Link</p>
            <Square2StackIcon className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>
      <div className={` ${logDrawerOpen ? "bg-zinc-900 p-2" : ""}`}>
        <div ref={animationParent} className="pl-1 md:pl-14">
          {logDrawerOpen && (
            <LogDrawer
              id={id}
              incrementReplyCount={incrementReplyCount}
              myReaction={myReaction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MessageComponent: React.FC<{ data: string }> = ({ data }) => {
  return (
    <Linkify
      options={{
        render: {
          url: ({ attributes, content }) => {
            const name = window.location.hostname;

            const localHostName = "http://localhost:3000";
            const localLiveName = `https://${name}.net`;

            const href = attributes.href as string | null | undefined;

            if (href === null || href === undefined) {
              return <div></div>;
            }

            const isInternal =
              href.startsWith("/") ||
              href.startsWith(localHostName) ||
              href.startsWith(localLiveName);

            if (isInternal) {
              const isProject =
                href.startsWith("/projects") ||
                href.startsWith("http://localhost:3000/projects/") ||
                href.startsWith(`https://${name}.net/projects/`);
              const isCrewMember =
                href.startsWith("/crewmember") ||
                href.startsWith("http://localhost:3000/crewmember/") ||
                href.startsWith(`https://${name}.net/crewmember/`);

              if (!isProject && !isCrewMember)
                return <InternalLink href={href} />;

              if (isProject) {
                const projectID = href.split("/")[href.split("/").length - 1];
                if (projectID !== undefined)
                  return (
                    <ProjectComponent
                      url={href}
                      id={projectID}
                      key={projectID}
                    />
                  );
              }
              if (isCrewMember) {
                const crewId = href.split("/")[href.split("/").length - 1];
                if (crewId !== undefined)
                  return <CrewComponent url={href} id={crewId} key={crewId} />;
              }
            }
            return <ExternalLink href={href} />;
          },
        },
      }}
      as="span"
    >
      {data}
    </Linkify>
  );
};

const ProjectComponent: React.FC<{ url: string; id: string }> = ({
  url,
  id,
}) => {
  const { data, isLoading } = api.projects.getById.useQuery({ id });

  if (isLoading) {
    return (
      <Link href={url}>
        <LoadingSpinner />
      </Link>
    );
  }

  if (data !== undefined && data !== null)
    return (
      <div className="flex items-start justify-start">
        <TooltipComponent content={`Visit Project`} side="top">
          <Link href={`/projects/${id}`}>
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex items-center justify-start gap-2 rounded border border-zinc-600 bg-zinc-700 p-1 transition-all duration-100 hover:border-amber-600 focus:border-amber-600"
            >
              <WrenchScrewdriverIcon className="mr-1 h-5 w-5" />
              <div>
                <p className="font-semibold">{data.name}</p>
                <div className="flex text-sm">
                  <p>{data.jobNumber}</p> <p>{data.sectors[0]?.name || ""}</p>
                </div>
              </div>
            </div>
          </Link>
        </TooltipComponent>
      </div>
    );

  return <div>{url}</div>;
};
const CrewComponent: React.FC<{ url: string; id: string }> = ({ url, id }) => {
  console.log(id);

  const { data, isLoading } = api.crewMembers.getById.useQuery({
    crewMemberId: id,
  });

  if (isLoading) {
    return (
      <Link href={url}>
        <LoadingSpinner />
      </Link>
    );
  }

  if (data !== undefined && data !== null)
    return (
      <div className="flex flex-col items-start justify-start gap-2">
        <TooltipComponent content={`Visit Crew`} side="top">
          <Link href={`/projects/${id}`}>
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded border border-zinc-600 bg-zinc-700 p-1 transition-all duration-100 hover:border-amber-600 focus:border-amber-600"
            >
              <div className="flex items-center justify-start gap-2">
                <div className="h-5 w-5">
                  <UserCircleIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{data.name}</p>
                  <div className="flex gap-2 text-sm">
                    <p>{data.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </TooltipComponent>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="block rounded bg-zinc-700 p-2 sm:hidden"
        >
          <a href={`tel:${data.phone}`} className="flex gap-2 md:hidden">
            <PhoneIcon className="h-5 w-5" />
            Call {data.name}
          </a>
        </div>
      </div>
    );

  return <div>{id}</div>;
};

const ExternalLink: React.FC<{ href: string }> = ({ href }) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogComponentManualOpenClose
      title="External Link"
      description={`You are about to go to ${href} Are you sure?`}
      yes={() => {
        setOpen(false);
        window.open(href || "", "_blank");
      }}
      no={() => {
        setOpen(false);
      }}
      open={open}
    >
      <button
        onClick={(e) => {
          setOpen(true);
          e.stopPropagation();
        }}
        className="text-blue-400 hover:underline"
      >
        {href}
      </button>
    </DialogComponentManualOpenClose>
  );
};

const InternalLink: React.FC<{ href: string }> = ({ href }) => {
  return (
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={href}
      className="text-blue-400 hover:underline"
    >
      {href}
    </Link>
  );
};

const LogDrawer: React.FC<{
  id: string;
  myReaction: LogReaction | undefined | null;
  incrementReplyCount: () => void;
}> = ({ id, incrementReplyCount, myReaction }) => {
  const { data, isLoading } = api.logs.getLogReactionsAndReplys.useQuery({
    logId: id,
    removeMyReactions: true,
  });

  const [animationParent] = useAutoAnimate();
  const [animationParent1] = useAutoAnimate();
  const [animationParent2] = useAutoAnimate();

  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "<unknown email>";

  const [message, setMessage] = useState("");




  const reactions = data?.logReactions.filter(
    (x) => x.user?.email !== userEmail
  );
  const replies = data?.logReplies;

  const context = api.useContext();

  const { mutate, isLoading: creating } =
    api.logReplies.createReply.useMutation({
      onSuccess: () => {
        void context.invalidate();
        setMessage("");
        incrementReplyCount();
      },
      onError: (e) => {
        console.log(e);
        toast.error("Failed to create reply");
      },
    });

  const createReply = () => {
    if (message.trim().length === 0) {
      toast.error("Reply cannot be empty");
      return;
    }

    mutate({
      logId: id,
      message,
    });
  };


  return (
    <div ref={animationParent}>
      <div
        ref={animationParent1}
        className="flex flex-wrap items-center justify-start gap-2 rounded border border-zinc-700 bg-zinc-800 p-2"
      >
        {myReaction && (
          <div
            key={myReaction.id}
            className="flex items-center gap-1 rounded text-zinc-300"
          >
            <p>{myReaction.reaction}</p>
            <p className="text-sm text-zinc-300">{userEmail}</p>
          </div>
        )}
        {!isLoading &&
          reactions &&
          reactions?.length > 0 &&
          reactions?.map((reaction) => (
            <div
              key={reaction.id}
              className="flex items-center gap-1 rounded text-zinc-300"
            >
              <p>{reaction.reaction}</p>
              <p className="text-sm text-zinc-300">
                {reaction.user?.email || "<unknown>"}
              </p>
            </div>
          ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {!isLoading &&
          reactions &&
          reactions?.length === 0 &&
          !myReaction?.reaction && (
            <div className="flex items-center gap-1 rounded px-2 text-zinc-500">
              <p>No Reactions</p>
            </div>
          )}
      </div>
      <div
        ref={animationParent2}
        className="ml-2 border-l border-amber-700 py-2 pr-2 md:ml-10"
      >
        {!isLoading && (
          <>
            <div className="flex w-full flex-col gap-2">
              {replies && replies?.length > 0 ? (
                <div>
                  {replies?.map((reply) => (
                    <div key={reply.id} className="w-full">
                      <ReplyComponent
                        reply={reply}
                        email={reply.user?.email || "<unknown>"}
                        logId={id}
                      />
                    </div>
                  ))}
                  <p className="flex w-full select-none items-center justify-center p-5 text-zinc-500">
                    ·
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-zinc-500 md:pr-14">
                  <p className="p-2"></p>
                </div>
              )}
            </div>
            <div>
              <div className="flex translate-x-[-0.4rem] items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-700" />
                <p className="pb-1 text-sm text-zinc-500">{userEmail}</p>
                <p className="pb-1 text-sm text-zinc-500">{"|"}</p>
                <p className="pb-1 text-sm text-zinc-500">
                  {dayjs(Date.now()).fromNow()}
                </p>
              </div>
              <div className="pl-2">
                <TextareaComponent
                  disabled={false}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  value={message}
                  error=""
                  placeholder="What's on your mind?"
                />
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      createReply();
                    }}
                    className="flex items-center justify-center gap-2 rounded bg-amber-700 p-2 hover:bg-amber-600 focus:bg-amber-600"
                  >
                    {creating && <LoadingSpinner />}
                    {!creating && (
                      <>
                        <p>Reply</p>
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {isLoading && (
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export const ReplyComponent: React.FC<{
  reply: LogReply;
  email: string;
  logId: string;
}> = ({ reply, email, logId }) => {
  const [message, setMessage] = useState(reply.message);
  const [showEdit, setShowEdit] = useState(false);

  const replyContext = api.useContext();

  const { mutate, isLoading } = api.logReplies.updateReply.useMutation({
    onSuccess: () => {
      toast.success("Reply updated");
      void replyContext.invalidate();
      setShowEdit(false);
    },
    onError: (e) => {
      console.log(e);
      toast.error("Failed to update reply");
    },
  });

  useMemo(() => {
    setMessage(reply.message);
  }, [reply.message]);

  const setEditMessage = useCallback(
    (message: string) => {
      if (message !== reply.message) {
        mutate({
          id: reply.id,
          message,
          logId,
        });
      }
    },
    [reply.message, reply.id, mutate, logId]
  );

  return (
    <>
      <div className="flex translate-x-[-0.4rem] items-center gap-2" w-full>
        <div className="h-3 w-3 rounded-full bg-amber-700" />
        <div className="flex gap-2 border-b border-zinc-700">
          <p className="pb-1 text-sm text-zinc-500">{email}</p>
          <p className="pb-1 text-sm text-zinc-500">{"|"}</p>
          <p className="pb-1 text-sm text-zinc-500">
            {dayjs(reply.updatedAt).fromNow()}
          </p>
          <EditModalComponent
            title="Edit Message"
            messageToEdit={message}
            open={showEdit}
            yes={(e) => {
              setEditMessage(e);
            }}
            cancel={() => {
              setShowEdit(false);
            }}
            loading={isLoading}
            trigger={
              <TooltipComponent content={`Edit Message`} side="top">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowEdit(true);
                  }}
                >
                  <div className="flex cursor-pointer items-center gap-1 rounded p-1 text-zinc-400 transition-all duration-100 hover:bg-zinc-800">
                    <PencilIcon className="h-4 w-4 " />
                  </div>
                </button>
              </TooltipComponent>
            }
          />
          {reply.editedMessage && (
            <TooltipComponent
              content={`previous message: \'${reply.editedMessage}\'`}
              side="top"
            >
              <p className="pb-1 text-sm text-zinc-500">
                {reply.editedMessage && "(edited)"}
              </p>
            </TooltipComponent>
          )}
        </div>
      </div>
      <div className="pl-3">
        <MessageComponent data={reply.message} />
      </div>
    </>
  );
};

export default RecentActivityPage;
