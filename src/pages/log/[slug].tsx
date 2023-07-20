import { useUser } from "@clerk/nextjs";
import { ArrowDownTrayIcon, ArrowLongUpIcon, ArrowUpRightIcon, ChevronDownIcon, Square2StackIcon } from "@heroicons/react/24/solid";
import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import TooltipComponent from "~/components/Tooltip";
import { LoadingPage, LoadingPage2 } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import React from "react";
import { utils, writeFileXLSX } from "xlsx";
import autoAnimate from "@formkit/auto-animate";

const LogPage: NextPage<{ id: string }> = ({ id }) => {

    console.log("LogPage", id);

    const { user, isSignedIn } = useUser();
    const [showRawData, setShowRawData] = React.useState(false);

    const { data, isLoading, isError } = api.logs.getById.useQuery({ id });

    const Copy = (url: string) => {
        void window.navigator.clipboard.writeText(url);
        toast.success("Copied to clipboard");
    };


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const DownloadLogXLSX = React.useCallback(() => {

        if (!data) return;

        const json = {
            Id: data.id,
            Name: data.name,
            Description: data.description,
            "Time (UTC)": data.updatedAt,
            Category: data.category,
            Severity: data.severity,
        }

        const ws = utils.json_to_sheet([json]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");

        const date = new Date().toUTCString();

        writeFileXLSX(wb, `Log\"${data.name}\" ${date} .xlsx`);
    }, [data]);


    const parent = React.useRef(null);

    React.useEffect(() => {
        if (!showRawData) scrollToTop();
        parent.current && autoAnimate(parent.current, { duration: 500, easing: "ease-in-out" });
    }, [showRawData]);


    if (!user) {
        return (
            <LoadingPage2 />
        );
    }

    if (isLoading) {
        return (
            <LoadingPage />
        );
    }

    if (!isSignedIn) {
        return (
            <SignInModal redirectUrl="/log/[slug]" />
        )
    }

    if (isError || !data) {
        return (
            <div className="min-h-[100vh] bg-zinc-900">
                <NewItemPageHeader title="LogHeader" />
                <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-2xl font-semibold text-white">Something went wrong getting the data.</div>
                </div>
            </div>
        )
    }

    const toggleShowRawData = () => {
        setShowRawData(!showRawData);
    }

    return (
        <div className="min-h-[100vh] bg-zinc-900">
            <NewItemPageHeader title={data.name} context={'activity'} />
            <div className="flex items-center justify-center w-full">
                <div className="flex flex-col w-full lg:w-[50vw]">
                    <div className="p-2">
                        <p className="text-xl pb-1">Name</p>
                        <p className="w-full p-1 bg-zinc-800 rounded">{data.name}</p>
                    </div>
                    <div className="p-2">
                        <p className="text-xl pb-1 whitespace-pre-wrap">Description</p>
                        <p className="w-full p-1 bg-zinc-800 rounded">{data.description}</p>
                    </div>
                    <div className="p-2">
                        <p className="text-xl pb-1">Time</p>
                        <p className="w-full p-1 bg-zinc-800 rounded">{data.updatedAt.toUTCString()}</p>
                    </div>
                    <div className="p-4" />
                    {
                        data.url && data.url.length > 0 && data.action == "url" || data.action == "external url" &&
                        (
                            <div className="p-2 w-full">
                                <div className="flex justify-between gap-2 w-full">
                                    <div className="flex gap-1 items-center">
                                        <p className="text-xl pb-1">Link</p>
                                        <ArrowUpRightIcon className="w-4 h-4 text-zinc-200" />
                                    </div>
                                    <TooltipComponent content="Copy link to clipboard" side={"top"} >
                                        <button onClick={() => Copy(data.url)} className="cursor-pointer">
                                            <Square2StackIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-200" />
                                        </button>
                                    </TooltipComponent>
                                </div>
                                <div className="w-full p-1 bg-zinc-800 rounded overflow-x-auto">
                                    <Link href={data.url} target="none" className="text-amber-600 cursor-pointer">{data.url}</Link>
                                </div>
                            </div>
                        )
                    }

                    <div className="p-2">
                        <p className="text-xl pb-1">Severity</p>
                        <p className="w-full p-1 bg-zinc-800 rounded">{data.severity}</p>
                    </div>
                    <div className="p-2">
                        <p className="text-xl pb-1">Category</p>
                        <p className="w-full p-1 bg-zinc-800 rounded">{data.category}</p>
                    </div>
                    <div className="p-2">
                        <div className="flex gap-1 items-center w-full justify-between">
                            <p className="text-xl pb-1">User</p>
                            <TooltipComponent content="Copy user email to clipboard" side={"top"} >
                                <button onClick={() => Copy(data.user?.email || "")} className="cursor-pointer">
                                    <Square2StackIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-200" />
                                </button>
                            </TooltipComponent>
                        </div>
                        <div className="flex gap-2 bg-zinc-800 rounded p-2 items-center justify-start">
                            <Image src={data.user?.profilePicture || ""} width={50} height={50} alt={`${data.user?.email || "unknown"}'s profile picture`} className="rounded-full" />
                            <p className="w-full font-semibold text-zinc-200">{data.user?.email || "<no email found>"}</p>
                        </div>
                    </div>
                    <div className="p-2">
                        <p className="text-xl pb-1">{"Extra Data (JSON)"}</p>
                        {
                            data.data !== null && data.data !== undefined && (
                                <p className="w-full p-1 bg-zinc-800 rounded">{JSON.stringify(data.data)}</p>
                            )
                        }
                        {
                            (data.data === null || data.data === undefined) && (
                                <p className="w-full p-1 bg-zinc-800 rounded text-zinc-400">{"<no extra data>"}</p>
                            )
                        }
                    </div>
                    <div className="p-4" />

                    <div>
                        <button onClick={toggleShowRawData} className="flex gap-2 transition-all duration-300 items-center text-zinc-500 hover:bg-zinc-700 hover:text-zinc-100 p-1 rounded">
                            <p>Stuff For Nerds</p>
                            <ChevronDownIcon className={`w-4 h-4 transition-all duration-300 ${showRawData ? "rotate-180" : ""}`} />
                        </button>
                    </div>
                    <div ref={parent}>
                        {showRawData && (
                            <>
                                <p className="m-2 text-2xl font-semibold border-b w-full border-zinc-700">Raw Data</p>
                                <div className="p-2 overflow-x-auto">
                                    <div className="flex gap-1 items-center w-full justify-between">
                                        <p className="text-xl pb-1">{"Table"}</p>
                                        <TooltipComponent content="Download .xlsx" side={"top"} >
                                            <button onClick={DownloadLogXLSX} className="cursor-pointer">
                                                <ArrowDownTrayIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-200" />
                                            </button>
                                        </TooltipComponent>
                                    </div>
                                    <table className="p-2 bg-zinc-800 rounded w-full peer-odd:bg-zinc-200">
                                        <tr className="border-b border-zinc-600">
                                            <th className="p-1 bg-zinc-700 rounded-tl">Id</th>
                                            <th className="p-1 bg-zinc-700">Name</th>
                                            <th className="p-1 bg-zinc-700">Description</th>
                                            <th className="p-1 bg-zinc-700">Time (UTC)</th>
                                            <th className="p-1 bg-zinc-700">Category</th>
                                            <th className="p-1 bg-zinc-700 rounded-tr">Severity</th>
                                        </tr>
                                        <tr className="">
                                            <td className="p-1  border-r border-zinc-600">{data.id}</td>
                                            <td className="p-1  border-r border-zinc-600">{data.name}</td>
                                            <td className="p-1  border-r border-zinc-600">{data.description}</td>
                                            <td className="p-1  border-r border-zinc-600 ">{data.updatedAt.toUTCString()}</td>
                                            <td className="p-1  border-r border-zinc-600">{data.category}</td>
                                            <td className="p-1">{data.severity}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="p-2">
                                    <div className="flex gap-1 items-center w-full justify-between">
                                        <p className="text-xl pb-1">JSON</p>
                                        <TooltipComponent content="Copy JSON to clipboard" side={"top"} >
                                            <button onClick={() => Copy(JSON.stringify(data))} className="cursor-pointer">
                                                <Square2StackIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-200" />
                                            </button>
                                        </TooltipComponent>
                                    </div>
                                    <div className="overflow-x-auto w-full bg-zinc-800 rounded">
                                        <p className="w-full p-1 whitespace-pre-wrap">{JSON.stringify(data, null, "\t")}</p>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="h-20"></div>
                        <button onClick={scrollToTop} className="w-full gap-2 flex items-center justify-center">
                            <p>Back To Top</p>
                            <ArrowLongUpIcon className="w-5 h-5 text-zinc-400 hover:text-zinc-200" />
                        </button>
                        <div className="h-20" />
                    </div>
                </div>
            </div>
        </div>
    )
}


export const getStaticProps: GetStaticProps = async (
    context: GetStaticPropsContext
) => {
    const helper = generateSSGHelper();

    const id = context.params?.slug;

    if (typeof id !== "string") throw new Error("slug is not a string");
    if (id.length <= 0) throw new Error("slug too short");

    await helper.logs.getById.prefetch({ id });

    const result = helper.dehydrate();

    return {
        props: {
            trpcState: result,
            id: id,
        },
        revalidate: 60,
    };
};

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking",
    };
};


export default LogPage;