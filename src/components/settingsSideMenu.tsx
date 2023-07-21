import autoAnimate from "@formkit/auto-animate";
import {
  Bars3Icon,
  ChevronLeftIcon,
  DocumentIcon,
  GlobeAmericasIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUser } from "@clerk/nextjs";
import { LoadingPage2 } from "./loading";
import SignInModal from "./signInPage";

const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const { user, isSignedIn } = useUser();

  const [showMenu, setShowMenu] = useState(true);

  const toggleShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const convertToBreadcrumb = (path: string) => {
    const pathArray = path.split("/");
    let breadcrumb = "";
    pathArray.forEach((element, index) => {
      if (index > 0) {
        breadcrumb +=
          element.charAt(0).toUpperCase() + element.slice(1) + " > ";
      }
    });
    return breadcrumb.substring(0, breadcrumb.length - 3);
  };

  if (!user || !isSignedIn) return <LoadingPage2 />;

  if (!isSignedIn) {
    <SignInModal />;
  }

  return (
    <main className="flex min-h-[100vh] justify-between bg-zinc-900">
      <SettingsMenu showMenu={showMenu} />
      <div
        className={`${
          showMenu ? "w-full lg:w-5/6" : "w-full"
        } p-2 transition-all duration-200`}
      >
        <div className="flex select-none items-center justify-start gap-2 pb-1">
          <button
            onClick={toggleShowMenu}
            className="hidden rounded bg-zinc-800 p-2 transition-all duration-100 hover:bg-zinc-700 lg:block"
          >
            {showMenu ? (
              <ChevronLeftIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>
          <MobileMenu />
          <p className="pb-1 text-lg font-semibold">
            {convertToBreadcrumb(router.pathname)}
          </p>
        </div>
        <div className="rounded bg-zinc-800 p-2">{children}</div>
      </div>
    </main>
  );
};

const MobileMenu = () => {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => {
          void router.back();
        }}
        className="block rounded bg-zinc-800 p-3 lg:hidden"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className="block rounded bg-amber-800 p-3 lg:hidden">
            <Bars3Icon className="h-5 w-5" />
          </button>
        </Dialog.Trigger>
        <Dialog.Overlay className="TooltipContent fixed inset-0 bg-black/50 backdrop-blur" />

        <Dialog.Content className="fade-y-long TooltipContent fixed inset-0 bottom-10 m-auto flex h-[60%] w-[70vw] flex-col items-start justify-between rounded-xl border border-zinc-900 bg-zinc-900">
          <div className="w-full">
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/settings/sectors");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <GlobeAmericasIcon className="h-5 w-5" />
                Sectors
              </button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/settings/permissions");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Permissions
              </button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/settings/users");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <UserGroupIcon className="h-5 w-5" />
                Users
              </button>
            </Dialog.DialogClose>
          </div>
          <div className="w-full pb-5">
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/dashboard/activity");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <NewspaperIcon className="h-5 w-5" />
                Hub
              </button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/dashboard/blueprints");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <DocumentIcon className="h-5 w-5" />
                Blueprints
              </button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/dashboard/crew");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <UserCircleIcon className="h-5 w-5" />
                Crew Members
              </button>
            </Dialog.DialogClose>
            <Dialog.DialogClose asChild>
              <button
                onClick={() => {
                  void router.push("/dashboard/projects");
                }}
                className={`flex w-full items-center justify-start gap-2 border-b border-zinc-600 p-3 text-lg font-bold transition-all duration-200`}
              >
                <WrenchScrewdriverIcon className="h-5 w-5" />
                Projects
              </button>
            </Dialog.DialogClose>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

const SettingsMenu: React.FC<{ showMenu: boolean }> = ({ showMenu }) => {
  const router = useRouter();
  const parent = useRef(null);

  useEffect(() => {
    parent.current &&
      autoAnimate(parent.current, { duration: 100, easing: "ease-in-out" });
  }, [showMenu]);

  return (
    <div ref={parent}>
      {showMenu && (
        <>
          <div
            className={`fixed hidden h-full w-1/6 select-none flex-col items-center justify-between border-r border-zinc-700 lg:flex`}
          >
            <div className="h-full w-full bg-zinc-800">
              <button
                onClick={() => {
                  router.back();
                }}
                className="flex w-full items-center justify-start gap-2 border-b border-zinc-700 bg-zinc-800 p-2 text-lg font-semibold transition-all duration-100 hover:bg-zinc-700"
              >
                <div className="h-4 w-4" />
                <ChevronLeftIcon className="h-5 w-5" />
                <p>Back</p>
              </button>
              <div className="h-full w-full bg-zinc-800">
                <MenuLink name="Sectors" link="/settings/sectors">
                  <GlobeAmericasIcon className="h-5 w-5" />
                </MenuLink>
                <MenuLink name="Permissions" link="/settings/permissions">
                  <ShieldCheckIcon className="h-5 w-5" />
                </MenuLink>
                <MenuLink name="Users" link="/settings/users">
                  <UserGroupIcon className="h-5 w-5" />
                </MenuLink>
              </div>
            </div>
            <div className="flex h-full w-full flex-col justify-end bg-zinc-800">
              <MenuLink name="Hub" link="/dashboard/activity">
                <NewspaperIcon className="h-5 w-5" />
              </MenuLink>
              <MenuLink name="Blueprints" link="/dashboard/blueprints">
                <DocumentIcon className="h-5 w-5" />
              </MenuLink>
              <MenuLink name="Crew" link="/dashboard/crew">
                <UserCircleIcon className="h-5 w-5" />
              </MenuLink>
              <MenuLink name="Projects" link="/dashboard/projects">
                <WrenchScrewdriverIcon className="h-5 w-5" />
              </MenuLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MenuLink: React.FC<{
  name: string;
  link: string;
  children: React.ReactNode;
}> = ({ name, link, children }) => {
  return (
    <div className="w-full cursor-pointer select-none justify-center gap-2 border-b border-zinc-700 p-2 font-semibold transition-all duration-100 hover:bg-amber-700">
      <Link
        href={`${link}`}
        className="flex h-full w-full items-center justify-start gap-2"
      >
        <div className="h-4 w-4" />
        {children}
        <p>{name}</p>
      </Link>
    </div>
  );
};

export default SettingsLayout;
