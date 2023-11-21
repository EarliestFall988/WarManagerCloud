import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  Cog8ToothIcon,
  DocumentIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  TruckIcon,
  UserCircleIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import TooltipComponent from "./Tooltip";
import { LogoComponent } from "./RibbonLogo";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { type NextRouter, useRouter } from "next/router";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import Image from "next/image";
import useSwipe from "./useSwipe";

// type Props = {
//     menuOpen?: boolean;
//     children: ReactNode;
// };

// const SettingsButton: FunctionComponent<Props> = (props) => {
//     return (
//         <Dialog.Root>
//             <TooltipComponent content="Settings" side="left">
//                 <Dialog.Trigger className="flex items-center justify-start gap-2 border-b border-zinc-700 p-2 text-white hover:bg-zinc-700 select-none">
//                     <Cog6ToothIcon className="h-7 w-7 text-zinc-200" />
//                     {props.menuOpen && <p> Settings</p>}
//                 </Dialog.Trigger>
//             </TooltipComponent>
//             <Dialog.Portal>
//                 <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur-sm" />
//                 <div className="flex h-screen w-screen items-center justify-center">
//                     <Dialog.Content className="fixed top-0 m-auto h-screen w-full border-zinc-600 bg-zinc-800 p-3 py-2 md:top-[11%] md:max-h-[80vh] md:w-3/4 md:rounded-lg md:border">
//                         <div className="flex w-full justify-between ">
//                             <Dialog.Title className="text-lg font-bold text-white">
//                                 Settings
//                             </Dialog.Title>
//                             <TooltipComponent content="Close" side="bottom">
//                                 <Dialog.Close asChild>
//                                     <button className="rounded p-2 text-center transition-all duration-100 hover:text-red-600">
//                                         <XMarkIcon className="h-6 w-6" />
//                                     </button>
//                                 </Dialog.Close>
//                             </TooltipComponent>
//                         </div>
//                         {props.children}
//                     </Dialog.Content>
//                 </div>
//             </Dialog.Portal>
//         </Dialog.Root>
//     );
// };

// const SectorsView = () => {
//     const [searchTerm, setSearchTerm] = useState("");

//     const {
//         data,
//         isLoading: loadingSearch,
//         isError: error,
//     } = api.sectors.getByName.useQuery({
//         name: searchTerm,
//     });

//     const context = api.useContext();

//     const { mutate, isLoading: isDeleting } = api.sectors.delete.useMutation({
//         onSuccess: () => {
//             void context.invalidate();
//             toast.success("Sector deleted successfully");
//         },

//         onError: (error) => {
//             console.log(error);
//             toast.error("Error deleting sector");
//         },
//     });

//     const handleDelete = (id: string) => {
//         toast.loading("Deleting sector...", {
//             duration: 1000,
//         });

//         mutate({
//             id,
//         });
//     };

//     const loading = loadingSearch || isDeleting;

//     return (
//         <div className="flex flex-col gap-2">
//             <div className="flex gap-1">
//                 <input
//                     className="w-full rounded bg-zinc-700 p-2 text-zinc-200 shadow outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-2 focus:ring-amber-500"
//                     placeholder="Search for a sector..."
//                     type="text"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     autoFocus
//                 />
//                 <TooltipComponent content="Add Sector" side="right">
//                     <Link
//                         href="/sectors/new"
//                         className="rounded bg-amber-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-amber-600"
//                     >
//                         <PlusIcon className="h-6 w-6 text-zinc-100" />
//                     </Link>
//                 </TooltipComponent>
//             </div>
//             <div className="flex max-h-[70vh] min-h-[10vh] flex-col gap-1 overflow-y-auto overflow-x-clip border-t border-zinc-600 pt-1 md:max-h-[60vh] md:px-2">
//                 {loading ? (
//                     <div className="flex h-[10vh] w-full items-center justify-center p-5">
//                         <LoadingSpinner />
//                     </div>
//                 ) : error ? (
//                     <div className="flex h-[10vh] items-center justify-center">
//                         <p className="text-center text-lg font-semibold text-red-500">
//                             There was an error. Try again later, or contact support.
//                         </p>
//                     </div>
//                 ) : (
//                     data?.map((sector) => (
//                         <div
//                             className="flex rounded bg-zinc-700 hover:bg-zinc-600 "
//                             key={sector.id}
//                         >
//                             <Link
//                                 href={`/sectors/${sector.id}`}
//                                 className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-l  px-1 py-2  "
//                             >
//                                 <div className="w-1/2  text-left">
//                                     <p className="truncate font-semibold text-zinc-200 sm:text-lg">
//                                         {sector.name}
//                                     </p>
//                                     <p className="truncate text-sm text-zinc-300 sm:text-xs">
//                                         {sector.departmentCode}
//                                     </p>
//                                 </div>
//                                 <div className="hidden sm:flex sm:w-1/3">
//                                     <p className="truncate text-center font-thin italic tracking-tight text-zinc-200">
//                                         {sector.description}
//                                     </p>
//                                 </div>
//                             </Link>
//                             <div className="flex justify-end">
//                                 <Dialog.Root>
//                                     <TooltipComponent
//                                         content={`Delete ${sector.name}`}
//                                         side="bottom"
//                                     >
//                                         <Dialog.Trigger asChild>
//                                             <button className="rounded p-2 text-center text-zinc-400 transition-all duration-100 hover:text-red-600">
//                                                 <TrashIcon className="h-6 w-6" />
//                                             </button>
//                                         </Dialog.Trigger>
//                                     </TooltipComponent>
//                                     <Dialog.Portal>
//                                         <Dialog.Overlay className="fixed inset-0 top-0 flex items-center justify-center bg-black/30 backdrop-blur-sm" />
//                                         <div className="flex h-screen w-screen items-center justify-center">
//                                             <Dialog.Content className="fixed top-0 m-auto h-screen w-full border-zinc-600 bg-zinc-800 p-3 py-2 md:top-[30%] md:h-40 md:max-h-[80vh] md:w-1/4 md:rounded-lg md:border">
//                                                 <div className="flex w-full justify-between ">
//                                                     <Dialog.Title className="text-lg font-bold text-white">
//                                                         Delete Sector
//                                                     </Dialog.Title>
//                                                     <Dialog.Close asChild>
//                                                         <button className="rounded p-2 text-center transition-all duration-100 hover:text-red-600">
//                                                             <XMarkIcon className="h-6 w-6" />
//                                                         </button>
//                                                     </Dialog.Close>
//                                                 </div>
//                                                 <p className="text-white">
//                                                     Are you sure you want to delete this sector? This
//                                                     action cannot be undone.
//                                                 </p>
//                                                 <div className="mt-2 flex justify-end">
//                                                     <Dialog.Close asChild>
//                                                         <button
//                                                             onClick={() => {
//                                                                 handleDelete(sector.id);
//                                                             }}
//                                                             className="rounded bg-red-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-red-600"
//                                                         >
//                                                             <p className="text-center text-lg font-semibold text-white">
//                                                                 I Understand, Delete Anyway
//                                                             </p>
//                                                         </button>
//                                                     </Dialog.Close>
//                                                 </div>
//                                             </Dialog.Content>
//                                         </div>
//                                     </Dialog.Portal>
//                                 </Dialog.Root>
//                             </div>
//                         </div>
//                     ))
//                 )}
//                 {data?.length === 0 && (
//                     <div className="flex h-[10vh] flex-col items-center justify-center gap-3">
//                         <p className="text-center text-2xl font-semibold text-zinc-400">
//                             No sectors found.
//                         </p>
//                         <Link
//                             href="/sectors/new"
//                             className="cursor-pointer rounded bg-amber-700 p-2 transition-all duration-100 hover:scale-105 hover:bg-amber-600"
//                         >
//                             <p className="text-center text-lg font-semibold text-white">
//                                 Create a sector now.
//                             </p>
//                         </Link>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// const Settings = () => {
//     return (
//         <div className="flex flex-col gap-2 rounded select-none">
//             <Tabs.Root defaultValue="tab1">
//                 <Tabs.List
//                     className="border-mauve6 flex shrink-0 border-b"
//                     aria-label="Manage your account"
//                 >
//                     <Tabs.Trigger
//                         className=" flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-zinc-800 px-5 text-[15px] leading-none text-zinc-200 outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:text-amber-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
//                         value="tab1"
//                     >
//                         Sectors
//                     </Tabs.Trigger>
//                     <Tabs.Trigger
//                         className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-zinc-800 px-5 text-[15px] leading-none text-zinc-200 outline-none first:rounded-tl-md last:rounded-tr-md data-[state=active]:text-amber-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative data-[state=active]:focus:shadow-[0_0_0_2px] data-[state=active]:focus:shadow-black"
//                         value="tab2"
//                     >
//                         Permissions
//                     </Tabs.Trigger>
//                 </Tabs.List>
//                 <Tabs.Content
//                     className="grow bg-zinc-800 p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
//                     value="tab1"
//                 >
//                     <SectorsView />
//                 </Tabs.Content>
//                 <Tabs.Content
//                     className="grow bg-zinc-800 p-5 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black"
//                     value="tab2"
//                 >
//                     <div className="text-center text-[2rem] font-semibold text-zinc-500">
//                         {"Under construction ... coming soon! "}
//                     </div>
//                 </Tabs.Content>
//             </Tabs.Root>
//         </div>
//     );
// };

export const DashboardMenu = () => {
  const [context, setContext] = useState("Blueprints");

  const [toggleOpen] = useState(false);
  // const [over, setOver] = useState(false);

  const router = useRouter();

  useMemo(() => {
    if (router.pathname === "/dashboard/crew") {
      setContext("CrewMembers");
    }

    if (router.pathname === "/dashboard/projects") {
      setContext("Projects");
    }

    if (router.pathname === "/dashboard/blueprints") {
      setContext("Blueprints");
    }

    if (router.pathname === "/dashboard/equipment") {
      setContext("Equipment");
    }

    if (router.pathname === "/dashboard/glance") {
      setContext("Home");
    }

    if (
      router.pathname === "/dashboard/activity" ||
      router.pathname === "/dashboard/activity/stats"
    ) {
      setContext("Activity");
    }

    if (router.pathname === "/dashboard/reporting") {
      setContext("Reporting");
    }
    if (router.pathname === "/dashboard/help") {
      setContext("Help");
    }
  }, [router.pathname]);

  const { user } = useUser();

  // const setToggle = (open: boolean) => {

  //     if (open) {
  //         setTimeout(function () {
  //             if (over) {
  //                 setToggleOpen(true);
  //             }
  //         }, 1000);
  //     }
  //     else {
  //         setToggleOpen(false);
  //     }
  // };

  return (
    <>
      <div className="md:w-12"></div>

      <div
        // onMouseEnter={() => {
        //     setToggle(true);
        //     setOver(true);
        // }}
        // onMouseLeave={() => {
        //     setOver(false);
        //     setToggle(false);
        // }}
        className={`z-30 hidden h-screen w-12 flex-col items-start justify-between overflow-x-clip border-r border-zinc-700 bg-zinc-800/90 backdrop-blur transition-all duration-75 ${
          toggleOpen ? "hover:w-1/6 hover:shadow-xl" : ""
        }  md:fixed md:flex`}
      >
        <div className="flex w-full select-none flex-col items-center justify-start">
          <TooltipComponent content="Hub" side="right">
            <button
              onClick={() => {
                // void router.push("/dashboard?context=Projects");
                void router.push("/dashboard/activity");
              }}
              className={`flex w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "Activity"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <NewspaperIcon className="h-6 w-6" />
              {toggleOpen && <p>Hub</p>}
            </button>
          </TooltipComponent>
          {/* <TooltipComponent
                        content="View Overall JR&CO Performance"
                        side="right"
                    >
                        <button
                            onClick={() => {
                                setContext("Home");
                                // void router.push("/dashboard?context=Home");
                                void router.push("/dashboard/glance");
                            }}
                            className={`flex  w-full gap-1 p-2 font-semibold transition-all ${toggleOpen ? "justify-start" : "justify-center"
                                } items-center duration-200 ${context === "Home"
                                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                                    : " border-b border-zinc-700 hover:bg-zinc-700"
                                }`}
                        >
                            <ChartBarIcon className="h-6 w-6" />
                            {toggleOpen && <p>Glance</p>}
                        </button>
                    </TooltipComponent> */}
          <TooltipComponent content="View all Blueprints" side="right">
            <button
              onClick={() => {
                setContext("Blueprints");
                // void router.push("/dashboard?context=Blueprints");
                void router.push("/dashboard/blueprints");
              }}
              className={`flex  w-full gap-1 p-2 font-semibold transition-all ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center duration-200 ${
                context === "Blueprints"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <DocumentIcon className="h-6 w-6" />
              {toggleOpen && <p>Blueprints</p>}
            </button>
          </TooltipComponent>
          <TooltipComponent content="View all Crew Members" side="right">
            <button
              onClick={() => {
                setContext("CrewMembers");
                // void router.push("/dashboard?context=CrewMembers");
                void router.push("/dashboard/crew");
              }}
              className={`flex  w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "CrewMembers"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <UserCircleIcon className="h-6 w-6" />
              {toggleOpen && <p>Crew</p>}
            </button>
          </TooltipComponent>
          <TooltipComponent content="View all Projects" side="right">
            <button
              onClick={() => {
                setContext("Projects");
                // void router.push("/dashboard?context=Projects");
                void router.push("/dashboard/projects");
              }}
              className={`flex w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "Projects"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <WrenchScrewdriverIcon className="h-6 w-6" />
              {toggleOpen && <p>Projects</p>}
            </button>
          </TooltipComponent>
          <TooltipComponent content="View all Equipment" side="right">
            <button
              onClick={() => {
                setContext("Equipment");
                // void router.push("/dashboard?context=Projects");
                void router.push("/dashboard/equipment");
              }}
              className={`flex w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "Equipment"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <TruckIcon className="h-6 w-6" />
              {toggleOpen && <p>Equipment</p>}
            </button>
          </TooltipComponent>

          {/* <TooltipComponent content="View reports and download xlsx documents" side="right">
                        <button
                            onClick={() => {
                                setContext("Reporting");
                                // void router.push("/dashboard?context=Projects");
                                void router.push("/dashboard/reporting")
                            }}
                            className={`flex w-full gap-1 p-2 font-semibold ${toggleOpen ? "justify-start" : "justify-center"
                                } items-center transition-all duration-200 ${context === "Reporting"
                                    ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                                    : " border-b border-zinc-700 hover:bg-zinc-700"
                                }`}
                        >
                            <DocumentTextIcon className="h-6 w-6" />
                            {toggleOpen && <p>Reporting</p>}
                        </button>
                    </TooltipComponent> */}
        </div>
        <div
          className={`flex w-full flex-col ${
            toggleOpen ? "" : "select-none items-center justify-center"
          } truncate whitespace-nowrap`}
        >
          <TooltipComponent content="Tips and Troubleshoot" side="right">
            <button
              onClick={() => {
                setContext("Help");
                // void router.push("/dashboard?context=Projects");
                void router.push("/dashboard/help");
              }}
              className={`flex w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "Help"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-y border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <QuestionMarkCircleIcon className="h-6 w-6" />
              {toggleOpen && <p>Help</p>}
            </button>
          </TooltipComponent>
          {/* <SettingsButton menuOpen={toggleOpen}>
                        <Settings />
                    </SettingsButton> */}
          <TooltipComponent content="Settings" side="right">
            <button
              onClick={() => {
                setContext("Settings");
                // void router.push("/dashboard?context=Projects");
                void router.push("/settings/sectors");
              }}
              className={`flex w-full gap-1 p-2 font-semibold ${
                toggleOpen ? "justify-start" : "justify-center"
              } items-center transition-all duration-200 ${
                context === "Settings"
                  ? "border border-amber-800 bg-amber-800 hover:bg-amber-700"
                  : " border-b border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <Cog8ToothIcon className="h-6 w-6" />
              {toggleOpen && <p>Settings</p>}
            </button>
          </TooltipComponent>
          <TooltipComponent content="Landing Page" side="right">
            <div className="border-b border-zinc-700">
              <Link
                className="flex select-none gap-2 p-2 transition-all duration-200 hover:bg-zinc-700"
                href="/"
              >
                <LogoComponent />
                {toggleOpen && "War Manager"}
              </Link>
            </div>
          </TooltipComponent>

          {user != null && (
            <div className="flex">
              <div className="flex w-5/6 items-center gap-2 p-2 transition-all duration-200">
                <UserButton />
                {toggleOpen && (
                  <>
                    <div className="flex flex-col md:w-4/6 xl:w-5/6 ">
                      <p className="w-full select-none truncate font-semibold md:text-sm">
                        {user?.fullName}
                      </p>
                      <p className="w-full select-none truncate text-sm text-zinc-400 md:text-xs">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {toggleOpen && (
                <TooltipComponent content="Sign Out" side="right">
                  <div className="h-full w-full border-l border-zinc-700">
                    <SignOutButton>
                      <div className="duration 200 flex h-full w-full cursor-pointer items-center justify-center transition-all hover:bg-zinc-700">
                        <ArrowRightOnRectangleIcon className="h-6 w-6 text-zinc-100" />
                      </div>
                    </SignOutButton>
                  </div>
                </TooltipComponent>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="z-30">
        <MobileMenu context={context} router={router} />
      </div>
    </>
  );
};

const MobileMenu: React.FC<{ context: string; router: NextRouter }> = ({
  context,
  router,
}) => {
  const [open, setOpen] = useState(false);

  const swipeHandlers = useSwipe({
    onSwipedDown: () => {
      setOpen(false);
    },
  });

  const { user } = useUser();

  const reload = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    router.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 flex items-center justify-around gap-1 p-2 md:hidden">
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={router.back}
          className="TooltipContent flex w-full gap-3 rounded-md bg-zinc-600 p-3 drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
        >
          <ArrowLeftIcon className="h-6 w-6 text-zinc-300" />
        </button>

        <button
          onClick={() => {
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            setOpen(!open);
          }}
          className="TooltipContent flex w-full gap-3 rounded-md bg-amber-700 p-3 outline-none drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
        >
          <Bars3Icon className="h-6 w-6 text-zinc-300" />
        </button>
        <Dialog.Root open={open}>
          <Dialog.Overlay onClick={() => {setOpen(false)}} className="TooltipContent fixed inset-0 bg-black/50 backdrop-blur-lg" />

          <Dialog.Content
            {...swipeHandlers}
            className="menu-mobile-appear TooltipContent fixed bottom-0 left-0 flex h-[70vh] w-[100vw] flex-col items-start justify-start rounded-lg bg-black"
          >
            <div className="h-[62vh] w-full">
              <div className="flex w-full  items-center justify-between">
                <div className="flex w-3/4 items-center justify-start gap-2 py-2">
                  <div className="pl-1" />
                  <Image
                    src={user?.profileImageUrl || ""}
                    width={32}
                    height={32}
                    alt="Profile Image"
                    className="rounded-full"
                  />
                  <p className="truncate text-ellipsis text-sm font-semibold text-zinc-400">
                    {user?.fullName}
                  </p>
                  {/* <SignOutButton>
                  <div
                    className={`flex items-center justify-start text-lg p-1 transition-all duration-200`}
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    Sign Out
                  </div>
                </SignOutButton> */}
                </div>

                <button onClick={reload} className="p-2">
                  <ArrowPathIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex h-full w-full flex-col justify-between">
                <div className="flex flex-col gap-1 border-t border-zinc-900">
                  <MobileItemButton
                    link="/dashboard/activity"
                    contextName="Activity"
                    currentContext={context}
                  >
                    <NewspaperIcon className="h-6 w-6" />
                    Hub
                  </MobileItemButton>
                  <MobileItemButton
                    link="/dashboard/blueprints"
                    contextName="Blueprints"
                    currentContext={context}
                  >
                    <DocumentIcon className="h-6 w-6" />
                    Blueprints
                  </MobileItemButton>
                  <MobileItemButton
                    link="/dashboard/crew"
                    contextName="CrewMembers"
                    currentContext={context}
                  >
                    <UsersIcon className="h-6 w-6" />
                    Crew
                  </MobileItemButton>
                  <MobileItemButton
                    link="/dashboard/projects"
                    contextName="Projects"
                    currentContext={context}
                  >
                    <WrenchScrewdriverIcon className="h-6 w-6 " /> Projects
                  </MobileItemButton>
                  <MobileItemButton
                    link="/dashboard/equipment"
                    contextName="Equipment"
                    currentContext={context}
                  >
                    <TruckIcon className="h-6 w-6 " /> Equipment
                  </MobileItemButton>
                </div>
                <div className="flex items-center justify-between px-5">
                  <Dialog.DialogClose asChild>
                    <button
                      onClick={() => {
                        void router.push("/dashboard/help");
                      }}
                      className={`flex items-center justify-start gap-2 p-3 text-lg font-bold transition-all duration-200 ${
                        context === "Help"
                          ? "bg-amber-800 hover:bg-red-700"
                          : "hover:bg-zinc-600 "
                      }`}
                    >
                      <QuestionMarkCircleIcon className="h-6 w-6 " />
                    </button>
                  </Dialog.DialogClose>
                  <Dialog.DialogClose asChild>
                    <button
                      onClick={() => {
                        void router.push("/settings/sectors");
                      }}
                      className={`flex items-center  justify-start gap-2 p-3 text-lg font-bold transition-all duration-200`}
                    >
                      <Cog8ToothIcon className="h-6 w-6 " />
                    </button>
                  </Dialog.DialogClose>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  );
};

const MobileItemButton: React.FC<{
  currentContext: string;
  contextName: string;
  children: React.ReactNode;
  link: string;
}> = ({ currentContext, link, contextName, children }) => {
  const router = useRouter();

  return (
    <Dialog.DialogClose asChild>
      <div
        className={`text-lg font-bold transition-all duration-200 ${
          currentContext === contextName
            ? "mx-1 w-[98%] rounded-2xl bg-amber-800 px-5 hover:bg-red-700 sm:w-[99%]"
            : "w-full px-4 hover:bg-zinc-600"
        }`}
      >
        <button
          onClick={() => {
            void router.push(link);
          }}
          className="flex w-full items-center justify-start gap-2 py-3"
        >
          {children}
        </button>
      </div>
    </Dialog.DialogClose>
  );
};

/* <Dialog.DialogClose asChild>
                  <button
                    onClick={() => {
                      void router.push("/dashboard/activity");
                    }}
                    className={`flex w-full items-center justify-start gap-2 p-4 text-lg font-bold transition-all duration-200 ${
                      context === "Activity"
                        ? "bg-amber-800 hover:bg-red-700"
                        : "border-b border-zinc-600 hover:bg-zinc-600"
                    }`}
                  >
                    <NewspaperIcon className="h-6 w-6" />
                    Hub
                  </button>
                </Dialog.DialogClose> */

/* <Dialog.DialogClose asChild>
                  <button
                    onClick={() => {
                      void router.push("/dashboard/blueprints");
                    }}
                    className={`flex w-full items-center justify-start gap-2 p-4 text-lg font-bold transition-all duration-200 ${
                      context === "Blueprints"
                        ? "bg-amber-800 hover:bg-red-700"
                        : "border-b border-zinc-600 hover:bg-zinc-600"
                    }`}
                  >
                    <DocumentIcon className="h-6 w-6" />
                    Blueprints
                  </button>
                </Dialog.DialogClose> 

              <Dialog.DialogClose asChild>
                  <button
                    onClick={() => {
                      void router.push("/dashboard/crew");
                    }}
                    className={`flex w-full items-center justify-start gap-2 p-4 text-lg font-bold transition-all duration-200 ${
                      context === "CrewMembers"
                        ? "bg-amber-800 hover:bg-red-700"
                        : "border-b border-zinc-600 hover:bg-zinc-600"
                    }`}
                  >
                    <UsersIcon className="h-6 w-6" />
                    Crew
                  </button>
                </Dialog.DialogClose> 
                <Dialog.DialogClose asChild>
                  <button
                    onClick={() => {
                      void router.push("/dashboard/projects");
                    }}
                    className={`flex w-full items-center justify-start gap-2 p-4 text-lg font-bold transition-all duration-200 ${
                      context === "Projects"
                        ? "bg-amber-800 hover:bg-red-700"
                        : "border-b border-zinc-600 hover:bg-zinc-600 "
                    }`}
                  >
                    <WrenchScrewdriverIcon className="h-6 w-6 " /> Projects
                  </button>
                </Dialog.DialogClose> 
               <Dialog.DialogClose asChild>
                  <button
                    onClick={() => {
                      void router.push("/dashboard/equipment");
                    }}
                    className={`flex w-full items-center justify-start gap-2 p-4 text-lg font-bold transition-all duration-200 ${
                      context === "Equipment"
                        ? "bg-amber-800 hover:bg-red-700"
                        : "border-b border-zinc-600 hover:bg-zinc-600 "
                    }`}
                  >
                    <TruckIcon className="h-6 w-6 " /> Equipment
                  </button>
                </Dialog.DialogClose> */
