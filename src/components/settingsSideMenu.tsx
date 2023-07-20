import autoAnimate from "@formkit/auto-animate";
import { Bars3Icon, ChevronLeftIcon, DocumentIcon, GlobeAmericasIcon, NewspaperIcon, ShieldCheckIcon, UserCircleIcon, UserGroupIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUser } from "@clerk/nextjs";
import { LoadingPage2 } from "./loading";
import SignInModal from "./signInPage";


const SettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const router = useRouter();

    const { user, isSignedIn } = useUser();

    const [showMenu, setShowMenu] = useState(true);

    const toggleShowMenu = () => {
        setShowMenu(!showMenu);
    }

    const convertToBreadcrumb = (path: string) => {
        const pathArray = path.split('/');
        let breadcrumb = '';
        pathArray.forEach((element, index) => {
            if (index > 0) {
                breadcrumb += element.charAt(0).toUpperCase() + element.slice(1) + ' > ';
            }
        });
        return breadcrumb.substring(0, breadcrumb.length - 3);
    }

    if (!user || !isSignedIn) return (
        <LoadingPage2 />
    )

    if (!isSignedIn) {
        <SignInModal />
    }

    return (
        <main className="flex justify-between min-h-[100vh] bg-zinc-900" >
            <SettingsMenu showMenu={showMenu} />
            <div className={`${showMenu ? "lg:w-5/6 w-full" : "w-full"} p-2 duration-200 transition-all`}>
                <div className='flex gap-2 pb-1 items-center justify-start select-none'>
                    <button onClick={toggleShowMenu} className='p-2 hidden lg:block rounded bg-zinc-800'>
                        {showMenu ? <ChevronLeftIcon className='h-5 w-5' /> : <Bars3Icon className='h-5 w-5' />}
                    </button>
                    <MobileMenu />
                    <p className='text-lg font-semibold pb-1'>{convertToBreadcrumb(router.pathname)}</p>
                </div>
                <div className='bg-zinc-800 p-2 rounded'>
                    {children}
                </div>
            </div>
        </main>
    )
}


const MobileMenu = () => {
    const router = useRouter();

    return (
        <Dialog.Root >
            <Dialog.Trigger asChild>
                <button className='p-2 block lg:hidden rounded bg-zinc-800'>
                    <Bars3Icon className='h-5 w-5' />
                </button>
            </Dialog.Trigger>
            <Dialog.Overlay className="TooltipContent fixed inset-0 bg-black/50 backdrop-blur" />

            <Dialog.Content className="fade-y-long TooltipContent fixed bottom-10 inset-0 h-[50vh] w-[70vw] m-auto flex flex-col items-start justify-start rounded-xl border border-zinc-900 bg-zinc-900">

                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.back();
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <ChevronLeftIcon className='h-5 w-5' />
                        Back
                    </button>
                </Dialog.DialogClose>
                <div className="p-5" />
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/settings/sectors");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <GlobeAmericasIcon className='h-5 w-5' />
                        Sectors
                    </button>
                </Dialog.DialogClose>
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/settings/permissions");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <ShieldCheckIcon className='h-5 w-5' />
                        Permissions
                    </button>
                </Dialog.DialogClose>
                <div className="p-5" />
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/dashboard/activity");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <NewspaperIcon className='h-5 w-5' />
                        Hub
                    </button>
                </Dialog.DialogClose>
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/dashboard/blueprints");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <DocumentIcon className='h-5 w-5' />
                        Blueprints
                    </button>
                </Dialog.DialogClose>
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/dashboard/crew");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <UserCircleIcon className='h-5 w-5' />
                        Crew Members
                    </button>
                </Dialog.DialogClose>
                <Dialog.DialogClose asChild>
                    <button
                        onClick={() => {
                            void router.push("/dashboard/projects");
                        }}
                        className={`w-full p-3 text-lg font-bold transition-all duration-200 flex items-center justify-start gap-2 border-b border-zinc-600`}
                    >
                        <WrenchScrewdriverIcon className='h-5 w-5' />
                        Projects
                    </button>
                </Dialog.DialogClose>
            </Dialog.Content>
        </Dialog.Root>
    )
}


const SettingsMenu: React.FC<{ showMenu: boolean }> = ({ showMenu }) => {

    const router = useRouter();
    const parent = useRef(null);

    useEffect(() => {
        parent.current && autoAnimate(parent.current, { duration: 100, easing: "ease-in-out" });
    }, [showMenu]);

    return (
        <div ref={parent} >
            {
                showMenu && (
                    <>
                        <div className={`w-1/6 h-full fixed hidden lg:flex flex-col items-center justify-between border-r border-zinc-700 select-none`}>
                            <div className="w-full h-full bg-zinc-800">
                                <button
                                    onClick={() => { router.back() }}
                                    className='font-semibold text-lg flex gap-2 p-2 items-center justify-start w-full bg-zinc-800 duration-100 transition-all hover:bg-zinc-700 border-b border-zinc-700'>
                                    <div className='w-4 h-4' />
                                    <ChevronLeftIcon className='h-5 w-5' />
                                    <p>Back</p>
                                </button>
                                <div className='w-full h-full bg-zinc-800'>
                                    <MenuLink name='Sectors' link='/settings/sectors' >
                                        <GlobeAmericasIcon className='h-5 w-5' />
                                    </MenuLink>
                                    <MenuLink name='Permissions' link='/settings/permissions' >
                                        <ShieldCheckIcon className='h-5 w-5' />
                                    </MenuLink>
                                    <MenuLink name='Users' link='/settings/users' >
                                        <UserGroupIcon className='h-5 w-5' />
                                    </MenuLink>
                                </div>
                            </div>
                            <div className="w-full h-full flex flex-col justify-end bg-zinc-800">
                                <MenuLink name='Hub' link='/dashboard/activity' >
                                    <NewspaperIcon className='h-5 w-5' />
                                </MenuLink>
                                <MenuLink name='Blueprints' link='/dashboard/blueprints' >
                                    <DocumentIcon className='h-5 w-5' />
                                </MenuLink>
                                <MenuLink name='Crew' link='/dashboard/crew' >
                                    <UserCircleIcon className='h-5 w-5' />
                                </MenuLink>
                                <MenuLink name='Projects' link='/dashboard/projects' >
                                    <WrenchScrewdriverIcon className='h-5 w-5' />
                                </MenuLink>
                            </div>
                        </div>
                    </>
                )}
        </div>
    )

}


const MenuLink: React.FC<{ name: string, link: string, children: React.ReactNode }> = ({ name, link, children }) => {
    return (
        <div className='font-semibold p-2 gap-2 hover:bg-amber-700 justify-center w-full duration-100 transition-all cursor-pointer border-b border-zinc-700 select-none'>
            <Link href={`${link}`} className='w-full flex gap-2 justify-start items-center'>
                <div className='w-4 h-4' />
                {children}
                <p>{name}</p>
            </Link>
        </div>
    )
}

export default SettingsLayout;

