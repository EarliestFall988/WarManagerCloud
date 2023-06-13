import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import TooltipComponent from "./Tooltip";
import { useRouter } from "next/router";

export const NewItemPageHeader = (props: {
  title: string;
  context?: string | undefined;
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between bg-zinc-700 p-2 text-center text-lg font-semibold">
      <TooltipComponent content="Back" side="bottom">
        <button>
          <ArrowLeftIcon className="h-6 w-6" onClick={() => router.back()} />
        </button>
      </TooltipComponent>
      <h1 className="text-[1rem] sm:text-lg">{props.title}</h1>
      <div className="hidden w-12 sm:flex" />
    </div>
  );
};


{/* {props.context == "blueprints" && (
        <TooltipComponent content="Back to Blueprints" side="bottom">
          <Link
            href="/dashboard?context=Blueprints"
            className="flex w-12 justify-center rounded p-1 transition-all duration-100 hover:bg-zinc-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
        </TooltipComponent>
      )}
      {props.context == "projects" && (
        <TooltipComponent content="Back to Projects" side="bottom">
          <Link
            href="/dashboard?context=Projects"
            className="flex w-12 justify-center rounded p-1 transition-all duration-100 hover:bg-zinc-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
        </TooltipComponent>
      )}
      {props.context == "crewmembers" && (
        <TooltipComponent content="Back to Crew Members" side="bottom">
          <Link
            href="/dashboard?context=CrewMembers"
            className="flex w-12 justify-center rounded p-1 transition-all duration-100 hover:bg-zinc-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
        </TooltipComponent>
      )} */}
