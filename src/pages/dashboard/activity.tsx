import { useUser } from "@clerk/nextjs";
import { ArrowUpRightIcon, ExclamationTriangleIcon, FunnelIcon, MegaphoneIcon, SparklesIcon, Square2StackIcon } from "@heroicons/react/24/solid";
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
dayjs.extend(relativeTime);

const RecentActivityPage: NextPage = () => {


  const { isSignedIn, isLoaded } = useUser();

  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

  const toggleFilter = useCallback(() => {
    setIsFilterVisible((prev) => !prev);
  }, []);

  const [filter, setFilter] = useState<DropdownTagType[]>([]);
  const [search, setSearch] = useState<string>("");
  // const [page, setPage] = useState<number>(1);
  // const [pageSize, setPageSize] = useState<number>(10);
  // const [sort, setSort] = useState<string>("createdAt:DESC");

  const { data, isLoading: loadingData, isError: errorLoadingData  } = api.logs.Search.useQuery({
    filter: filter.map((f) => f.value),
    search,
  });

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/activity" />;
  }

  return (
    <main className="flex min-h-[100vh] bg-zinc-900">
      <DashboardMenu />
      <div className="w-full">
        <div className="fixed top-0 z-20 w-full md:w-[94%] lg:w-[96%] p-2 bg-zinc-900/80 backdrop-blur">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl p-2 font-semibold select-none">Activity Timeline</h1>
            <div className="block lg:hidden">
              <button
                onClick={toggleFilter}
              >
                <FunnelIcon className="h-6 w-6 text-zinc-400" />
              </button>
            </div>
          </div>
          <div>
            <InputComponent placeholder="search" autoFocus onChange={(e) => setSearch(e.currentTarget.value)} value={search} disabled={false} />
            <FilterAndSearch visible={isFilterVisible} onFilter={setFilter} />
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
            <div className="sm:w-full lg:w-[50vw] flex flex-col border-t border-x rounded-sm border-zinc-700 m-auto">

              {data.length > 0 && data?.map((log) => {
                return <ActivityListItem key={log.id} severity={log.severity} profileURl={log.user?.profilePicture || ""} description={log.description} category={log.category} name={log.name} author={log.user?.email || "unknown"} link={log.url} action={log.action} actionTime={log.updatedAt || log.createdAt} />
              })}
            </div>
            <div className="flex items-center justify-center p-5 text-zinc-600 select-none">End of Timeline</div>
            <div className="h-36" />
          </>
        )}
        {data?.length === 0 && !loadingData && (
          <div className="flex h-full w-full items-center justify-center p-4 text-zinc-400 gap-2 select-none">
            <p className="text-lg text-zinc-300 select-none">
              No Activity Found
            </p>
            <SparklesIcon className="h-6 w-6" />
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

const FilterAndSearch: React.FC<{ visible: boolean, onFilter: (tags: DropdownTagType[]) => void }> = ({ visible, onFilter }) => {

  return (
    <>
      <div className="flex justify-between flex-wrap lg:flex-nowrap gap-2 lg:gap-11" >
        {visible && (
          <>
            <MultiSelectDropdown onSetTags={onFilter} selectedTags={[]} placeholder="Filter By Log Severity, Category, or User" />
          </>)}
      </div>
      <div className="justify-between hidden lg:flex flex-wrap lg:flex-nowrap gap-2 lg:gap-11" >
        <MultiSelectDropdown onSetTags={onFilter} selectedTags={[]} placeholder="Filter By Log Severity, Category, or User" />
      </div>
    </>
  )
}

export const MultiSelectDropdown: React.FC<{ selectedTags: DropdownTagType[], placeholder?: string, onSetTags: (tags: DropdownTagType[]) => void }> = ({ selectedTags, onSetTags, placeholder }) => {


  const [allTags, setAllTags] = useState<DropdownTagType[]>([]);

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

  }, [allTags, onSetTags]);



  useMemo(() => {

    const baseTags = [
      {
        value: "moderate",
        label: "Moderate Severity",
        color: "gray",
      },
      {
        value: "critical",
        label: "Critical Severity",
        color: "gray",
      },
      {
        value: "info",
        label: "Info Severity",
        color: "gray",
      },
      {
        value: "blueprint",
        label: "Blueprints",
        color: "gray",
      },
      {
        value: "crew",
        label: "Crew Members",
        color: "gray",
      },
      {
        value: "project",
        label: "Projects",
        color: "gray",
      },
      {
        value: "other",
        label: "Other",
        color: "gray",
      },
    ] as DropdownTagType[];

    setAllTags(baseTags);

    if (users != null && !loadingUsers && !errorLoadingUsers) {

      users.forEach((user) => {

        const email = user?.User?.emailAddresses[0]?.emailAddress;

        if (email) {
          baseTags.push({
            value: user.User.id,
            label: email,
            color: "gray",
          });
        }
      });
    }

    setAllTags(baseTags);
  }, [users, loadingUsers, errorLoadingUsers])


  return (
    <Select
      closeMenuOnSelect={false}
      defaultValue={selectedTags}
      isMulti
      name="currentTags"
      options={allTags}
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


const ActivityListItem: React.FC<{ action: string, description: string, severity: string, profileURl: string, category: string, name: string, author: string, link: string, actionTime: Date }> = ({ action, severity, profileURl, description, name, author, link, actionTime }) => {

  const Copy = (url: string) => {
    void window.navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (

    <div className={`border-b border-zinc-700 ${severity === "critical" ? "bg-gradient-to-bl from-amber-800/30" : ""} pt-1 rounded-sm`}>
      <div className="flex flex-col justify-center items-center p-2 rounded-sm select-none">
        <div className="flex gap-2 items-start w-full">
          <Image src={profileURl} className="h-12 w-12 rounded-full" width={64} height={64} alt={`${author}'s profile picture`} />
          <div className="flex flex-col">
            <div className="pb-2">
              <div className="flex gap-2">
                <p className="text-sm text-zinc-500">{author}</p>
                <p className="text-sm text-zinc-500" >|</p>
                <p className="text-sm text-zinc-500">{dayjs(actionTime).fromNow()}</p>
              </div>
              <div className="flex items-center gap-1">
                {
                  severity === "critical" && (
                    <div className="flex gap-1 items-center flex-col">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                  )
                }
                {
                  severity === "moderate" && (
                    <div className="flex gap-1 items-center flex-col">
                      <MegaphoneIcon className="h-4 w-4 text-blue-500" />
                    </div>
                  )
                }
                <p className="text-lg font-semibold pb-1">{name}</p>
              </div>
              <p className="text-sm">{description}</p>
            </div>
            <div className="flex justify-start gap-2 -mx-2">
              {
                action === "url" && (
                  <Link href={link} passHref className="flex gap-1 items-center cursor-pointer rounded p-2 hover:bg-zinc-800 duration-100 transition-all">
                    <p className="text-sm text-zinc-200">View</p>
                    <ArrowUpRightIcon className="h-4 w-4 text-zinc-400" />
                  </Link>
                )
              }
              {
                <button onClick={() => {
                  Copy(author)
                }} className="flex gap-1 items-center cursor-pointer rounded p-2 hover:bg-zinc-800 duration-100 transition-all">
                  <p className="text-sm text-zinc-200">Copy Email</p>
                  <Square2StackIcon className="h-4 w-4 text-zinc-400" />
                </button>
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
        </div>
      </div>
    </div>
  )
}

export default RecentActivityPage;