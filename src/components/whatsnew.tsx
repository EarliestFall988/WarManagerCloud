import { useUser } from "@clerk/nextjs";
import {
  ArrowSmallLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";

const WhatsNew: React.FC<{setSeenFeatures: () => void}> = ({setSeenFeatures}) => {
  const { user } = useUser();

  return (
    <div className="fixed top-0 z-40 flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur">
      <div className="flex h-full w-full flex-col items-center justify-between rounded bg-zinc-800 p-3 md:h-3/4 md:w-3/4 lg:h-2/3 lg:w-2/3 ">
        <div className="w-full border-b border-zinc-700 pb-3">
          {(user?.firstName && user?.lastName && (
            <h1 className="text-2xl font-semibold md:text-3xl">
              {`Something new for you, ${user.firstName}! `}
            </h1>
          )) || (
            <h1 className="text-2xl font-semibold md:text-3xl">
              {`What's New?`}
            </h1>
          )}
        </div>
        <div className="flex h-4/5 w-4/5 flex-col items-center lg:justify-between lg:flex-row">
          <div className="h-1/3 lg:w-1/3 flex items-center justify-center">
            <p className="text-2xl">
              Find all schedules by clicking on the calendar button 🎉🎉
            </p>
          </div>
          <div className="hidden h-2/3 w-2/3 items-center justify-end lg:flex">
            <Link
              className="hover:cursor-pointer"
              target="_blank"
              href="https://youtu.be/2RHzK-6tp8A?si=A5wAWQPHjdeIsh4R"
            >
              <Image
                width="600"
                height="700"
                className="rounded-lg border-2 border-transparent shadow-lg transition duration-200 hover:scale-105 hover:border-amber-600"
                src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/War%20Manager%203%20Materials/finding-schedules.gif"
                alt="finding schedules gif"
              />
            </Link>
          </div>
          <div className="flex items-center justify-end lg:hidden">
            <Link
              className="hover:cursor-pointer"
              target="_blank"
              href="https://youtu.be/2RHzK-6tp8A?si=A5wAWQPHjdeIsh4R"
            >
              <Image
                width="900"
                height="1000"
                className="rounded-lg border-2 border-transparent shadow-lg transition duration-200 hover:scale-105 hover:border-amber-600"
                src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/War%20Manager%203%20Materials/finding-schedules.gif"
                alt="finding schedules gif"
              />
            </Link>
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-t border-zinc-700 pt-3">
          {/* <button className="flex w-32 items-center justify-center rounded-sm bg-zinc-600 p-2">
            <ArrowSmallLeftIcon className="h-6 w-6 text-zinc-100" />
          </button> */}
          <div/>
          <button onClick={setSeenFeatures} className="flex w-32 items-center justify-center rounded-sm bg-amber-600 p-2">
            <CheckIcon className="h-6 w-6 text-zinc-100" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
