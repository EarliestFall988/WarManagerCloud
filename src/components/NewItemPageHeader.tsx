import { ArrowLeftIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";
import TooltipComponent from "./Tooltip";
import { useRouter } from "next/router";
import { LoadingSpinner } from "./loading";

export const NewItemPageHeader: React.FC<{ title: string, context?: string | undefined, save?: () => void | undefined, deleting?: boolean, cancel?: () => void, saving?: boolean }> = ({
  title,
  save,
  cancel,
  deleting,
  saving
}) => {
  const router = useRouter();


  return (
    <>
      <div className="select-none fixed top-0 z-20 w-full flex items-center shadow-lg border-b border-zinc-700 justify-between bg-zinc-800/90 backdrop-blur-md p-2 text-center text-lg font-semibold">
        <TooltipComponent content="Back" side="bottom">
          <button disabled={saving} className="p-2 hover:bg-zinc-600 rounded disabled:text-zinc-400" onClick={() => {
            if (cancel !== undefined) {
              cancel();
            }
            else {
              router.back();
            }
          }}>
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </TooltipComponent>
        {!saving && !deleting && <h1 className="fade-x text-[1rem] sm:text-lg w-2/3 truncate">{title}</h1>}
        {saving && <h1 className="fade-x text-[1rem] sm:text-lg w-2/3 truncate">Saving <span>{title}</span>...</h1>}
        {deleting && <h1 className="fade-x text-[1rem] sm:text-lg w-2/3 truncate">Deleting <span>{title}</span>...</h1>}
        <div className="flex gap-2 items-center" >
          {save !== undefined && <TooltipComponent content="Save Changes" side="bottom">
            <button disabled={saving || deleting} onClick={save} className="p-2 flex justify-center items-center bg-amber-700 rounded font-normal hover:scale-105 hover:bg-amber-600 duration-100 transition-all disabled:bg-zinc-600/70 disabled:text-zinc-400">
              {(saving || deleting) ? <LoadingSpinner /> : <CloudArrowUpIcon className="h-6 w-6" />}
            </button>
          </TooltipComponent>
          }
        </div>
      </div>
      <div className="h-20" />
    </>
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
