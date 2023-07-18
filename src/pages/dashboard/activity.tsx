import { useUser } from "@clerk/nextjs";
import { ArrowUpRightIcon, CakeIcon, ExclamationTriangleIcon, Square2StackIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback } from "react";
import { DashboardMenu } from "~/components/dashboardMenu";

import { LoadingPage2, LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "react-hot-toast";
import { type DropdownTagType } from "~/components/TagDropdown";
import Select, { type MultiValue } from "react-select";
dayjs.extend(relativeTime);

// const SchedulesContainer = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const {
//     data: links,
//     isLoading,
//     isError,
//   } = api.schedules.getByName.useQuery({ name: searchTerm });

//   return (
//     <>
//       <Head>
//         <title>Recent Activity | War Manager</title>
//       </Head>
//       <div className="flex h-[50vh] w-full flex-col gap-1 rounded border border-zinc-700 p-3 mx-auto">
//         <h1 className="text-2xl font-semibold">Schedules</h1>
//         <input
//           type="search"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="search schedules"
//           className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
//         />
//         <div className="border-t border-zinc-700">
//           {isLoading ? (
//             <div className="flex h-full w-full items-center justify-center p-4">
//               <LoadingSpinner />
//             </div>
//           ) : isError ? (
//             <p>Error Loading Schedules</p>
//           ) : (
//             <div className="flex flex-col gap-2">
//               <div className="flex flex-col gap-2">
//                 {links?.length === 0 ? (
//                   <div className="flex h-full w-full items-center justify-center p-4">
//                     <p className="text-lg italic text-zinc-400">
//                       No Schedules Found
//                     </p>
//                   </div>
//                 ) : (
//                   links?.map((link) => {
//                     return <ScheduleItem key={link.id} data={link} />;
//                   })
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

const RecentActivityPage: NextPage = () => {


  const { isSignedIn, isLoaded } = useUser();

  const { data, isLoading: loadingData, isError: errorLoadingData } = api.logs.getAll.useQuery();


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
          <h1 className="text-2xl p-2 font-semibold select-none">Activity Timeline</h1>
          {/* <InputComponent placeholder="search" autoFocus disabled={false} onChange={(e) => console.log(e)} value="" /> */}
          <MultiSelectDropdown allTags={tags} onSetTags={(e) => console.log(e)} selectedTags={[{
            value: "all",
            label: "All",
            color: "gray",
          }]} />
        </div>

        <div className="h-36" />
        {loadingData && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <LoadingSpinner />
          </div>
        )}
        {!loadingData && !errorLoadingData && (
          <div className="sm:w-full lg:w-[50vw] flex flex-col border-t border-x rounded-sm border-zinc-700 m-auto">

            {data.length > 0 && data?.map((log) => {
              return <ActivityListItem key={log.id} severity={log.severity} profileURl={log.user?.profilePicture || ""} description={log.description} category={log.category} name={log.name} author={log.user?.email || "unknown"} link={log.url} action={log.action} actionTime={log.updatedAt || log.createdAt} />
            })}
            {
              data.length === 0 && (
                <div className="flex h-full w-full items-center justify-center p-4 text-zinc-400 gap-2 select-none">
                  <p className="text-lg italic text-zinc-400 select-none">
                    No Activity Found
                  </p>
                  <CakeIcon className="h-8 w-8" />
                </div>
              )
            }
          </div>
        )}
        <div className="flex items-center justify-center p-5 text-zinc-600 select-none">End of Timeline</div>
        <div className="h-36" />
      </div>

    </main>
  );
};

const tags = [
  {
    value: "all",
    label: "All",
    color: "gray",
  },
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

export const MultiSelectDropdown: React.FC<{ selectedTags: DropdownTagType[], placeholder?: string, allTags: DropdownTagType[], onSetTags: (tags: DropdownTagType[]) => void }> = ({ selectedTags, allTags, onSetTags, placeholder }) => {

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


  return (
    <Select
      closeMenuOnSelect={false}
      defaultValue={selectedTags}
      isMulti
      name="currentTags"
      options={tags}
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
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                      {/* <p className="text-sm text-red-500/60"> {severity}</p> */}
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