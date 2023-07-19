import { useUser } from "@clerk/nextjs";
import { ArrowLongUpIcon, ArrowPathRoundedSquareIcon, ArrowUpRightIcon, ExclamationTriangleIcon, FunnelIcon, MegaphoneIcon, SparklesIcon, Square2StackIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import { DashboardMenu } from "~/components/dashboardMenu";

import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { type DropdownTagType } from "~/components/TagDropdown";
import Select, { type MultiValue } from "react-select";
import { InputComponent } from "~/components/input";
import { useRouter } from "next/router";
import TooltipComponent from "~/components/Tooltip";
dayjs.extend(relativeTime);

const RecentActivityPage: NextPage = () => {


  const { isSignedIn, isLoaded } = useUser();

  const router = useRouter();

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isClearFilters, setClearfilters] = useState<boolean>(false);

  const toggleFilter = useCallback(() => {
    setIsFilterVisible((prev) => !prev);
  }, []);

  const [filter, setFilter] = useState<DropdownTagType[]>([]);
  const [search, setSearch] = useState<string>("");
  // const [page, setPage] = useState<number>(1);
  // const [pageSize, setPageSize] = useState<number>(10);
  // const [sort, setSort] = useState<string>("createdAt:DESC");

  const context = api.useContext().logs;

  const { data, isLoading: loadingData, isError: errorLoadingData } = api.logs.Search.useQuery({
    filter: filter.map((f) => f.value),
    search,
  });

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
  }

  const refresh = () => {
    void context.invalidate();
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="flex min-h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="w-full">
        <div className="fixed top-0 z-10 w-full md:w-[94%] lg:w-[96%] p-2 bg-zinc-900/80 backdrop-blur">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl p-2 font-semibold select-none">Activity Timeline</h1>
            <div className="flex gap-2">
              <TooltipComponent content="Refresh" side="bottom">
                <button
                  className="flex gap-2 p-1 rounded bg-zinc-800 text-200"
                  onClick={refresh}
                >
                  <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
              <div className="block lg:hidden">
                <button
                  className="flex gap-2 p-1 rounded bg-zinc-800 text-200"
                  onClick={toggleFilter}
                >
                  <FunnelIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <InputComponent placeholder="search" autoFocus onChange={(e) => setSearch(e.currentTarget.value)} value={search} disabled={false} />
            <FilterAndSearch setClearFilters={() => { setClearfilters(false); }} onClose={() => { setIsFilterVisible(false) }} clearFilters={isClearFilters} visible={isFilterVisible} onFilter={setFilter} />
          </div>
        </div>


        {loadingData && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <LoadingSpinner />
          </div>
        )}
        {!loadingData && !errorLoadingData && data && data?.length > 0 && (
          <>
            <div className="lg:h-48 h-32" />
            <div className="m-auto sm:w-full lg:w-[50vw] flex items-center justify-end p-2">
              <TooltipComponent content="Refresh" side="top">
                <button
                  className="flex gap-2 p-1 rounded text-zinc-500 transition-all duration-100 hover:text-zinc-300 hover:scale-110"
                  onClick={refresh}
                >
                  <ArrowPathRoundedSquareIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
            </div>
            <div className="sm:w-full lg:w-[50vw] flex flex-col border-t border-x rounded-sm border-zinc-700 m-auto">
              {data.length > 0 && data?.map((log) => {

                return <ActivityListItem key={log.id} id={log.id} severity={log.severity} profileURl={log.user?.profilePicture || ""} description={log.description} category={log.category} name={log.name} author={log.user?.email || "unknown"} link={log.url} action={log.action} actionTime={log.updatedAt || log.createdAt} />
              })}
            </div>
            <div className="flex flex-col items-center justify-center gap-4 p-5 text-zinc-600 select-none">
              <p>End of Timeline</p>
              <TooltipComponent content="Scroll To Top" side="top">
                <button
                  className="flex gap-2 p-1 rounded text-zinc-500 transition-all duration-100 hover:text-zinc-300 hover:scale-110"
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
          <div className="flex h-full w-full items-center justify-center p-4 text-zinc-400 gap-2 select-none">
            <div className={`flex gap-2 ${filter.length > 0 || search.trim().length > 0 ? "border-r p-2 border-zinc-600" : ""}`}>
              <p className="text-lg text-zinc-300 select-none">
                No Activity Found
              </p>
              <SparklesIcon className="h-6 w-6" />
            </div>
            {
              (filter.length > 0 || search.trim().length > 0) && (
                <>
                  <button onClick={clear} className="text-zinc-500 hover:text-amber-400 transition-colors duration-200 ease-in-out">
                    Clear
                  </button>
                </>
              )
            }
          </div>
        )}
        {
          errorLoadingData && (
            <div className="flex h-full w-full items-center justify-center p-4 text-red-500 gap-2 select-none">
              <p className="text-lg font-semibold text-red-400 select-none">
                Error Loading Activity
              </p>
              <ExclamationTriangleIcon className="h-6 w-6 rotate-6" />
            </div>
          )}
      </div>
    </main>
  );
};

const FilterAndSearch: React.FC<{ visible: boolean, clearFilters: boolean, setClearFilters: () => void, onClose: () => void, onFilter: (tags: DropdownTagType[]) => void }> = ({ visible, onClose, setClearFilters, clearFilters, onFilter }) => {

  return (
    <>
      <div className={`flex justify-between flex-wrap lg:hidden lg:flex-nowrap gap-2 lg:gap-11 ${visible ? "p-1 bg-zinc-800 border border-zinc-500" : ""} rounded`} >
        {visible && (
          <>
            <MultiSelectDropdown setclearFilters={setClearFilters} clearFilters={clearFilters} onSetTags={onFilter} selectedTags={[]} placeholder="Filter By Log Severity, Category, and User" />
            <button onClick={onClose} className="flex items-center justify-center gap-2 w-full bg-red-900/30 rounded p-1">
              <XMarkIcon className="h-6 w-6 text-red-400" />
            </button>
          </>)}
      </div>
      <div className="justify-between hidden lg:flex flex-wrap lg:flex-nowrap gap-2 lg:gap-11" >
        <MultiSelectDropdown setclearFilters={setClearFilters} clearFilters={clearFilters} onSetTags={onFilter} selectedTags={[]} placeholder="Filter By Log Severity" />
      </div>
    </>
  )
}

export const MultiSelectDropdown: React.FC<{ selectedTags: DropdownTagType[], setclearFilters: () => void, placeholder?: string, clearFilters: boolean, onSetTags: (tags: DropdownTagType[]) => void }> = ({ selectedTags, setclearFilters, clearFilters, onSetTags, placeholder }) => {


  const [allTags, setAllTags] = useState<DropdownTagType[]>([]);
  const [currentTags, setCurrentTags] = useState<DropdownTagType[]>([]);

  const { data: users, isLoading: loadingUsers, isError: errorLoadingUsers } = api.users.getAllUsers.useQuery();


  const onChange = useCallback((e: MultiValue<{
    value: string;
    label: string;
    color: string;
  }>) => {

    const tags = [] as DropdownTagType[]

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

  }, [allTags, onSetTags, setclearFilters]);



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
      }
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
  }, [users, loadingUsers, errorLoadingUsers])


  useMemo(() => {
    if (clearFilters) {
      onChange([]);
    }
  }, [clearFilters, onChange])

  return (
    <Select
      closeMenuOnSelect={false}
      defaultValue={selectedTags}
      isMulti
      name="currentTags"
      options={allTags}
      value={currentTags}
      classNamePrefix="select"
      className="w-full ring-2 ring-zinc-700 rounded outline-none hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800 text-zinc-300"
      onChange={(e) => { onChange(e) }}
      unstyled
      placeholder={placeholder || "add..."}
      classNames={{
        valueContainer(props) {
          return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${props.selectProps.classNamePrefix ? props.selectProps.classNamePrefix + "-value-container" : ""}`;
        },
        multiValue() {
          return `text-zinc-300 border border-zinc-300 px-2 rounded-xl px-1 flex items-center text-sm`;
        },
        container({ isFocused }) {
          return `w-full bg-zinc-800 rounded ${isFocused ? "ring-2 ring-amber-700" : "hover:ring-zinc-600 hover:ring-2"} `;
        },
        menuList() {
          return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
        },
        option() {
          return `hover:bg-zinc-700 hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
        }
      }}
    />
  )
}

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
}

const ActivityListItem: React.FC<activityListItemType> = ({ action, severity, profileURl, description, name, author, link, actionTime, id }) => {

  const Copy = (url: string) => {
    void window.navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const router = useRouter();

  return (

    <div className={`border-b border-zinc-700 ${severity === "critical" ? "bg-gradient-to-bl from-amber-800/30" : ""} p-2 `}>

      <Link href={`/log/${id}`} className="flex gap-2 items-start justify-start w-full cursor-pointer">
        <div className="hidden md:block">
          <Image src={profileURl} className="h-12 w-12 flex-shrink-0 rounded-full select-none" width={32} height={32} alt={`${author}'s profile picture`} />
        </div>
        <div className="block flex-shrink-0 md:hidden">
          <Image src={profileURl} className="h-10 w-10 rounded-full select-none" width={32} height={32} alt={`${author}'s profile picture`} />
        </div>
        <div className="flex flex-col truncate">
          <div className="pb-2 truncate">
            <div className="flex gap-2 items-center">
              {
                (severity === "critical" || severity === "moderate") && (

                  <div className="block md:hidden">
                    {
                      severity === "critical" && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 select-none" />
                      )
                    }
                    {
                      severity === "moderate" && (
                        <MegaphoneIcon className="h-4 w-4 text-blue-300" />
                      )
                    }
                  </div>
                )}
              <p className="text-sm text-zinc-500">{author}</p>
              <p className="text-sm text-zinc-500" >|</p>
              <p className="text-sm text-zinc-500">{dayjs(actionTime).fromNow()}</p>
            </div>
            <div className="flex items-center justify-start gap-1">
              <p className="text-lg font-semibold pb-1">{name}</p>
              {
                severity === "critical" && (
                  <div className="hidden md:flex gap-1 items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 select-none" />
                    <p className="text-xs text-yellow-500 select-none">Critical</p>
                  </div>
                )
              }
              {
                severity === "moderate" && (
                  <div className="hidden md:flex gap-1 items-center select-none">
                    <MegaphoneIcon className="h-4 w-4 text-blue-300" />
                    <p className="text-xs text-blue-300">Moderate</p>
                  </div>
                )
              }
            </div>
            <p className="text-sm w-full whitespace-pre-wrap">{description}</p>
          </div>
          <div className="flex justify-start gap-2 select-none">
            {
              (action === "url" || action === "external url") && (
                <button onClick={(e) => {
                  void router.push(link);
                  e.preventDefault();
                }}

                  className="flex gap-1 items-center cursor-pointer rounded p-1 hover:bg-zinc-800 duration-100 transition-all">
                  <p className="text-sm text-zinc-200">View</p>
                  <ArrowUpRightIcon className="h-4 w-4 text-zinc-400" />
                </button>
              )
            }
            {
              <button onClick={(e) => {
                Copy(author);
                e.preventDefault();
              }}

                className="flex gap-1 items-center cursor-pointer rounded p-1 hover:bg-zinc-800 duration-100 transition-all">
                <p className="text-sm text-zinc-200">{"Copy Author's Email"}</p>
                <Square2StackIcon className="h-4 w-4 text-zinc-400" />
              </button>
            }
            {
              action === "external url" && (
                <button onClick={(e) => {
                  Copy(link);
                  e.preventDefault();
                }} className="flex gap-1 items-center cursor-pointer rounded p-1 hover:bg-zinc-800 duration-100 transition-all">
                  <p className="text-sm text-zinc-200">Copy Link</p>
                  <Square2StackIcon className="h-4 w-4 text-zinc-400" />
                </button>
              )
            }
            {/* {
                action === "url" && (
                  <Link href={link} passHref className="flex gap-1 items-center cursor-pointer rounded p-2 bg-zinc-800 hover:bg-amber-700">
                    <p className="text-sm text-zinc-200">Comment</p>
                    <ChatBubbleBottomCenterIcon className="h-4 w-4 text-zinc-200" />
                  </Link>
                )
              }
              {
                action === "url" && (
                  <Link href={link} passHref className="flex gap-1 items-center cursor-pointer rounded p-2 bg-zinc-800 hover:bg-amber-700">
                    <p className="text-sm text-zinc-200">React</p>
                    <HeartIcon className="h-4 w-4 text-zinc-200" />
                  </Link>
                )
              } */}
          </div>
        </div>
      </Link>
    </div >
  )
}

export default RecentActivityPage;