import { ArrowLeftIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";
import TooltipComponent from "./Tooltip";
import { useRouter } from "next/router";
import { LoadingSpinner } from "./loading";

export const NewItemPageHeader: React.FC<{
  title: string;
  context?: string | undefined;
  save?: () => void | undefined;
  deleting?: boolean;
  cancel?: () => void;
  saving?: boolean;
}> = ({ title, save, cancel, deleting, saving, context }) => {
  const router = useRouter();

  return (
    <>
      <div className="fixed top-0 z-20 flex w-full select-none items-center justify-between border-b border-zinc-700 bg-zinc-800/90 p-2 text-center text-lg font-semibold shadow-lg backdrop-blur-md">
        <TooltipComponent content="Back" side="bottom">
          <button
            disabled={saving}
            className="rounded p-2 hover:bg-zinc-600 disabled:text-zinc-400"
            onClick={() => {
              if (cancel !== undefined) {
                cancel();
              } else {
                if (history.length > 0) router.back();
                else if (context != null)
                  void router.push(`/dashboard/${context}`);
                else void router.push(`/dashboard/activity`);
              }
            }}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        {!saving && !deleting && (
          <h1 className="fade-x w-2/3 truncate text-[1rem] sm:text-lg">
            {title}
          </h1>
        )}
        {saving && (
          <h1 className="fade-x w-2/3 truncate text-[1rem] sm:text-lg">
            Saving <span>{title}</span>...
          </h1>
        )}
        {deleting && (
          <h1 className="fade-x w-2/3 truncate text-[1rem] sm:text-lg">
            Deleting <span>{title}</span>...
          </h1>
        )}
        <div className="flex items-center gap-2">
          {save !== undefined && (
            <TooltipComponent content="Save Changes" side="bottom">
              <button
                disabled={saving || deleting}
                onClick={save}
                className="flex items-center justify-center rounded bg-amber-700 p-2 font-normal transition-all duration-100 hover:scale-105 hover:bg-amber-600 disabled:bg-zinc-600/70 disabled:text-zinc-400"
              >
                {saving || deleting ? (
                  <LoadingSpinner />
                ) : (
                  <CloudArrowUpIcon className="h-6 w-6" />
                )}
              </button>
            </TooltipComponent>
          )}
        </div>
      </div>
      <div className="h-20" />
    </>
  );
};

{
  /* {props.context == "blueprints" && (
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
      )} */
}
