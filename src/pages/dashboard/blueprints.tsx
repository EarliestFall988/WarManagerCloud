import { DocumentIcon, PlusIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import TooltipComponent from "~/components/Tooltip";
import { LoadingHeader } from "~/components/loading";
import { api } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import { DashboardMenu } from "~/components/dashboardMenu";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";

dayjs.extend(relativeTime);


const BlueprintsListPage: NextPage = () => {

    const { isSignedIn } = useUser();

    const [blueprintSearchTerm, setBlueprintSearchTerm] = useState("");

    const {
        data,
        isLoading: loadingBlueprints,
        isError: loadingBlueprintsError,
    } = api.blueprints.search.useQuery({
        search: blueprintSearchTerm,
    });

    // const data = props.data;

    // if (loadingBlueprints)
    //   return (
    //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-zinc-700/30 p-2 sm:w-[74vw]">
    //       <LoadingSpinner />
    //     </div>
    //   );

    // if (loadingBlueprintsError || !data)
    //   return (
    //     <div className="m-auto flex h-[50vh] w-full flex-col items-center justify-center gap-2 rounded bg-red-500/10 p-2 sm:w-[74vw]">
    //       <p className="text-lg italic text-red-500">Could not load blueprints</p>
    //     </div>
    //   );

    if (!isSignedIn) {
        return <SignInModal redirectUrl="/dashboard/crew" />;
     }

    return (
        <>
            <div className="flex w-full min-h-[100vh] bg-zinc-900" >
            <DashboardMenu />
            <div className="w-full">
                <div className=" flex w-full items-center justify-start gap-1 p-2">
                    <input
                        type="search"
                        value={blueprintSearchTerm}
                        onChange={(e) => setBlueprintSearchTerm(e.target.value)}
                        placeholder="search blueprints"
                        className="w-full rounded bg-zinc-800 p-2 outline-none ring-1 ring-inset ring-zinc-700 placeholder:italic placeholder:text-zinc-400 hover:bg-zinc-700 focus:ring-amber-700 sm:w-3/5"
                    />
                    <TooltipComponent content="Create a New Blueprint" side="bottom">
                        <Link
                            href="/newblueprint"
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-zinc-700 bg-gradient-to-br text-center transition-all duration-100 hover:bg-amber-700 sm:text-lg sm:font-semibold"
                        >
                            <PlusIcon className="h-6 w-6" />
                        </Link>
                    </TooltipComponent>
                </div>

                {loadingBlueprints ? (
                    <LoadingHeader loading={loadingBlueprints} title="Loading Blueprints" />
                ) : loadingBlueprintsError || !data ? (
                    <div className="flex items-center justify-center w-full">
                        <p className="text-lg italic text-red-500">
                            Could not load blueprints
                        </p>
                    </div>
                ) : (
                    data.length > 0 && (
                        <div className="flex w-full flex-col gap-1 border-t border-zinc-700 p-2 text-gray-100">
                            {data?.map((blueprint) => (
                                <div
                                    key={blueprint.id}
                                    className="flex w-full items-center justify-between gap-1 rounded-sm "
                                >
                                    <Link
                                        href={`/blueprints/${blueprint.id}`}
                                        passHref
                                        className="flex w-full cursor-pointer items-center justify-between gap-1 rounded-sm bg-zinc-700 p-2 transition-all duration-100 hover:bg-zinc-600"
                                    >
                                        <DocumentIcon className="h-6 w-6 text-zinc-300" />
                                        <h2 className="w-3/2 truncate text-left text-lg font-semibold tracking-tight sm:w-1/4">
                                            {blueprint.name}
                                        </h2>
                                        <div className="hidden font-thin sm:flex sm:w-1/2 ">
                                            <p className="w-full truncate text-ellipsis text-center">
                                                {blueprint.description}
                                            </p>
                                        </div>
                                        <p className="w-1/4 truncate text-right text-sm italic">
                                            {dayjs(blueprint.updatedAt).fromNow()}
                                        </p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )
                )}
                {data?.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-xl font-bold text-zinc-300">
                            No Blueprints matching your search {`'${blueprintSearchTerm}'`}
                        </p>
                    </div>
                )}
            </div>
            </div>
        </>
    );
}

export default BlueprintsListPage;