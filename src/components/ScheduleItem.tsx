import { ArrowUpRightIcon } from "@heroicons/react/24/solid"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-hot-toast";


type linkWithUser = {
    user: null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    link: string;
    authorId: string;
} | {
    user: {
        id: string;
        email: string | undefined;
        profilePicture: string;
    };
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string;
    link: string;
    authorId: string;
}


const Copy = (url: string) => {
    void window.navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
};


export const ScheduleItem: React.FC<{ data: linkWithUser }> = ({ data }) => {

    return (
        <button
            onClick={() => Copy(data.link)}
            key={data.id}
            className="flex w-full items-center justify-between border-b border-zinc-600 transition-all duration-200 hover:rounded-sm hover:bg-zinc-600 sm:py-2  "
        >
            <div className="flex w-8/12 items-center">
                {data && data.user && data.user.profilePicture && (
                    <Image
                        className="scale-75 rounded-full sm:scale-90"
                        src={data.user.profilePicture}
                        width={50}
                        height={50}
                        alt={`${data.user.email || "unknown"} + 's profile picture`}
                    />
                )}
                <div className="flex w-5/6 flex-col items-start justify-center pl-1 sm:w-2/3 ">
                    {data.user?.profilePicture === null && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-400">
                            <p className="font-semibold text-white">
                                {data.user?.email?.charAt(0).toUpperCase()}
                            </p>
                        </div>
                    )}
                    <p className="w-full truncate text-left text-lg font-semibold tracking-tight">
                        {data.title}
                    </p>
                    <p className="text-sm text-zinc-400">
                        {data.user?.email || "unknown"}
                    </p>
                </div>
            </div>
            <p className="hidden italic text-zinc-300 sm:flex sm:w-1/2">
                {data.description}
            </p>

            <Link
                href={data.link}
                target="_blank"
                passHref
                className="rounded bg-zinc-600 p-2 hover:scale-105 hover:bg-zinc-500"
            >
                <ArrowUpRightIcon className="h-5 w-5 text-white" />
            </Link>
        </button>
    )
}