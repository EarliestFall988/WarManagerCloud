import { type Node } from "reactflow";
import useNodesStateSynced, { GetNodes, nodesMap } from "./useNodesStateSynced";
import useLiveData from "./databank";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/solid";
import TooltipComponent from "~/components/Tooltip";
import { api } from "~/utils/api";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { GetEdges } from "./useEdgesStateSynced";
import { useRouter } from "next/router";
import { LoadingSpinner } from "~/components/loading";
import { DialogComponent } from "~/components/dialog";
import { Disconnect } from "./ydoc";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import * as Dialog from "@radix-ui/react-dialog";
import { type ScheduleHistory } from "@prisma/client";

import { useMemo } from "react";

type project = {
  id: string;
  name: string;
  crew: {
    id: string;
    name: string;
  }[];
};

type structure = {
  projects: project[];
  remainingNodes: remainingNode[];
};

type remainingNode = {
  id: string;
  name: string;
};

type projectNode = {
  id: string;
  data: {
    id: string;
  };
};

type crewNode = {
  id: string;
  data: {
    id: string;
  };
};

export const GetListOfNodesSortedByColumn = (blueprintId: string) => {
  const yMap = nodesMap(blueprintId);

  const nodes = [] as Node[];

  yMap.forEach((node) => {
    nodes.push(node);
  });

  const nodesSortedByColumn = nodes.sort((a, b) => {
    const xCol = a.position.x - b.position.x;

    if (xCol <= -15 || xCol >= 15) {
      return xCol;
    } else {
      return 0;
    }
  });

  //   console.log("sorted by column", nodesSortedByColumn);

  return nodesSortedByColumn;
};

export const GetListOfNodesSorted = (nodes: Node[]) => {
  const nodesSortedByColumn = nodes.sort((a, b) => {
    const xCol = a.position.x - b.position.x;

    if (xCol <= -15 || xCol >= 15) {
      return xCol;
    } else {
      return 0;
    }
  });

  //   console.log("sorted by column", nodesSortedByColumn);

  return nodesSortedByColumn;
};

const useCreateStructure = (n: Node[]) => {
  let s = {} as structure;
  const nodes = GetListOfNodesSorted(n);

  const { projectData, crewData, isLoading } = useLiveData();

  //   useEffect(() => {
  if (!nodes || isLoading || !projectData) return s;

  let currentProject = undefined as project | undefined;

  const structure = {
    projects: [] as project[],
    remainingNodes: [] as remainingNode[],
  };

  nodes.forEach((node) => {
    if (node.type === "projectNode") {
      const projectNode = node as projectNode;

      const info = projectData.find((node) => node.id == projectNode.data.id);
      if (!info) return;
      structure.projects.push({
        id: node.id,
        name: info.name,
        crew: [],
      });

      currentProject = structure.projects[structure.projects.length - 1];
    } else if (node.type === "crewNode") {
      const crewNode = node as crewNode;

      const info = crewData.find((node) => node.id == crewNode.data.id);
      if (!info) return;

      if (currentProject !== undefined) {
        currentProject.crew.push({
          id: node.id,
          name: info.name,
        });
      } else {
        const crewNode = node as crewNode;
        const info = crewData.find((node) => node.id == crewNode.id);
        if (!info) return;

        structure.remainingNodes.push({
          id: node.id,
          name: info.name,
        });
      }
    }
  });

  s = structure;
  //   }, [nodes, projectData, crewData, isLoading]);

  return s;
};

const Ribbon: React.FC<{
  blueprintId: string;
  liveData: boolean;
  name: string;
  description: string;
}> = ({ blueprintId, liveData, name, description }) => {
  const [Nodes] = useNodesStateSynced(blueprintId);
  useCreateStructure(Nodes);

  const router = useRouter();

  const [animationSaveParent] = useAutoAnimate();

  const d = new Date();
  d.setDate(d.getDate() + 1);

  const getNextMonday = (anyDate: Date) => {
    const dayOfWeek = anyDate.getDay();
    const aux = dayOfWeek ? 1 : -6; //if it is sunday or not
    const nextMonday = new Date();
    nextMonday.setDate(anyDate.getDate() - dayOfWeek + aux + 7);
    return nextMonday;
  };

  const get5DaysFromNow = (anyDate: Date) => {
    const dayOfWeek = anyDate.getDay();
    const aux = dayOfWeek ? 1 : -6; //if it is sunday or not
    const nextMonday = new Date();
    nextMonday.setDate(anyDate.getDate() - dayOfWeek + aux + 4);
    return nextMonday;
  };

  const [startDate, setStartDate] = useState(getNextMonday(d));
  const [endDate, setEndDate] = useState(get5DaysFromNow(getNextMonday(d)));

  const [lastSchedule, setLastSchedule] = useState<
    ScheduleHistory | undefined
  >();

  const backButton = () => {
    if (history.length > 0) router.back();
    else void router.push(`/dashboard/blueprints`);

    Disconnect();
  };

  const [goToGantt, setGoToGantt] = useState(false);
  const [back, setBack] = useState(false);

  const [onUpdateSchedule, setOnUpdateSchedule] = useState(false);

  const { mutate, isLoading: isSaving } = api.blueprints.save.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} saved successfully`);
      if (goToGantt) {
        setGoToGantt(false);
        void router.push(`/blueprints/${data.id}/gantt`);
        Disconnect();
      }

      if (back) {
        setBack(false);
        backButton();
      }
    },

    onError: (error) => {
      setGoToGantt(false);
      console.log("error saving blueprint", error);
      toast.error("Error saving blueprint");
    },
  });

  const { data, isLoading, isError } =
    api.timeScheduling.getTimeSchedulesByBlueprintId.useQuery({
      blueprintId,
    });

  const { mutate: deleteTimeSchedule } =
    api.timeScheduling.deleteTimeSchedules.useMutation({
      onSuccess: () => {
        toast.success("Schedule deleted successfully");

        if (onUpdateSchedule) {
          setOnUpdateSchedule(false);
          void router.push(`/blueprints/${blueprintId}/gantt`);
        }
      },
      onError: (error) => {
        toast.error("Error deleting schedule");
        console.log("error deleting schedule", error);
      },
    });

  useMemo(() => {
    const getLastUncommittedSchedule = () => {
      if (!data) return undefined;

      const lastSchedule = data[0];

      if (lastSchedule?.committed) return undefined;

      return lastSchedule;
    };

    setLastSchedule(getLastUncommittedSchedule());

    if (lastSchedule) {
      setStartDate(new Date(lastSchedule.defaultStartDate));
      setEndDate(new Date(lastSchedule.defaultEndDate));
    }
  }, [lastSchedule, data]);

  const onSave = useCallback(
    (startDate: Date, endDate: Date, setDates?: boolean) => {
      if (!blueprintId) return;

      const nodes = GetNodes(blueprintId);
      const edges = GetEdges(blueprintId);

      const flowInstance = JSON.stringify({
        nodes,
        edges,
        viewport: {
          x: 0,
          y: 0,
          zoom: 1,
        },
      });

      mutate({
        blueprintId,
        flowInstanceData: flowInstance,
        live: liveData,
        scheduling: setDates,
        startDate: startDate,
        endDate: endDate,
      });
    },
    [mutate, blueprintId, liveData]
  );

  const OnScheduleTime = useCallback(
    (startDate: Date, endDate: Date) => {
      if (!blueprintId) return;

      console.log(
        "selected scheduled time",
        startDate.toDateString(),
        endDate.toDateString()
      );

      setGoToGantt(true);
      onSave(startDate, endDate, true);
    },
    [blueprintId, onSave]
  );

  return (
    <div className="absolute inset-0 top-0 z-20 flex h-12 w-full items-center justify-between bg-zinc-700 p-1 text-gray-100 drop-shadow-md ">
      <div className="flex w-1/2 items-center justify-start gap-4 sm:w-1/3">
        <DialogComponent
          title="Save changes?"
          description="Do you want to push your changes to the cloud before leaving?"
          yes={() => {
            setBack(true);
            onSave(new Date(), new Date());
          }}
          no={backButton}
          highlightYes={true}
          trigger={
            <div className="cursor-pointer rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500">
              {isSaving && back ? (
                <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
              ) : (
                <ArrowLeftIcon className="h-6 w-6" />
              )}
            </div>
          }
        />

        <div className="max-w-1/2 truncate rounded p-1 text-center text-sm font-semibold tracking-tight text-zinc-200 md:text-lg">
          {name ? (
            <div className="flex select-none items-center gap-1 py-1">
              {liveData ? (
                <TooltipComponent content="Live Data" side="bottom">
                  <CheckBadgeIcon className="inline-block h-4 w-4 text-zinc-300" />
                </TooltipComponent>
              ) : (
                <div>
                  <TooltipComponent content="Zen Mode" side="bottom">
                    <PaintBrushIcon className="inline-block h-4 w-4 text-zinc-300" />
                  </TooltipComponent>
                </div>
              )}
              <TooltipComponent
                content={description || "<no description>"}
                side="bottom"
              >
                <p>{isSaving ? `Saving ${name}` : name}</p>
              </TooltipComponent>
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
      {name && (
        <div className="flex w-1/2 items-center justify-end gap-1 sm:w-1/3 sm:gap-2">
          <TooltipComponent
            content="Share blueprint with other managers (link)"
            side="bottom"
            disableToolTipIfNoContent={true}
          >
            <button
              className="flex rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
              onClick={() => {
                void navigator.clipboard.writeText(`${window.location.href}`);
                toast.success("Copied blueprint link to clipboard");
              }}
            >
              <ArrowTopRightOnSquareIcon className="h-6 w-6" />
            </button>
          </TooltipComponent>

          <TooltipComponent
            content="Save changes to the Cloud"
            side="bottom"
            disableToolTipIfNoContent={true}
          >
            <button
              className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
              onClick={() => {
                setGoToGantt(false);
                onSave(new Date(), new Date());
              }}
            >
              <div ref={animationSaveParent}>
                {!isSaving && <CloudArrowUpIcon className="h-6 w-6" />}
                {isSaving && (
                  <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
                    <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
                  </div>
                )}
              </div>
            </button>
          </TooltipComponent>
          <div className="flex items-center rounded border-green-600 bg-green-700 ">
            <NextButton
              lastSchedule={lastSchedule}
              isLoading={isLoading}
              isError={isError}
              updateSchedule={(id, s, e) => {
                setOnUpdateSchedule(true);
                deleteTimeSchedule({ id });
                OnScheduleTime(s, e);
              }}
              blueprintId={blueprintId}
              newSchedule={(s, e) => {
                OnScheduleTime(s, e);
              }}
              highlightYes
              startDate={startDate}
              endDate={endDate}
              setStartDate={(e) => {
                setStartDate(e);
              }}
              setEndDate={(e) => {
                setEndDate(e);
              }}
              goToGantt={goToGantt}
              isSaving={isSaving}
              SaveChanges={() => {
                onSave(startDate, endDate);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const NextButton: React.FC<{
  description?: string;
  newSchedule: (startDate: Date, endDate: Date) => void;
  updateSchedule: (id: string, startDate: Date, endDate: Date) => void;
  lastSchedule: ScheduleHistory | undefined;
  SaveChanges: () => void;
  no?: () => void;
  highlightYes?: boolean;
  highlightNo?: boolean;
  blueprintId: string;
  isLoading: boolean;
  isError: boolean;
  startDate: Date;
  endDate: Date;
  setStartDate: (e: Date) => void;
  setEndDate: (e: Date) => void;
  isSaving: boolean;
  goToGantt: boolean;
}> = ({
  newSchedule,
  updateSchedule,
  blueprintId,
  isLoading,
  isError,
  lastSchedule,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isSaving,
  goToGantt,
  SaveChanges,
}) => {
  const lastUncommittedScheduleExists =
    lastSchedule !== undefined && lastSchedule.committed === false;

  const router = useRouter();

  const [animationParent] = useAutoAnimate({ duration: 100 });

  const saving = isSaving && goToGantt;

  return (
    <div ref={animationParent}>
      {saving ? (
        <p className="p-2">Saving...</p>
      ) : (
        <>
          {!lastUncommittedScheduleExists && (
            <DateScheduleDialog
              lastSchedule={lastSchedule}
              isLoading={isLoading}
              isError={isError}
              updateSchedule={(id, s, e) => {
                updateSchedule(id, s, e);
              }}
              blueprintId={blueprintId}
              newSchedule={(s, e) => {
                newSchedule(s, e);
              }}
              highlightYes
              startDate={startDate}
              endDate={endDate}
              setStartDate={(e) => {
                setStartDate(e);
              }}
              setEndDate={(e) => {
                setEndDate(e);
              }}
            >
              <div
                className={`flex cursor-pointer items-center gap-2 rounded p-2 text-white transition duration-300 hover:bg-green-600 focus:bg-green-600`}
              >
                <p>Next</p>
                <ArrowRightIcon className="h-5 w-5" />
              </div>
            </DateScheduleDialog>
          )}
          {lastUncommittedScheduleExists && (
            <div className="flex items-center justify-start">
              <button
                onClick={() => {
                  SaveChanges();
                  void router.push(`/blueprints/${blueprintId}/gantt`);
                }}
                className="rounded p-2 hover:bg-green-600 focus:bg-green-600"
              >
                Next
              </button>
              <div className="h-8 w-1 border-r border-zinc-400" />
              <div className="h-8 w-1" />
              <DateScheduleDialog
                lastSchedule={lastSchedule}
                isLoading={isLoading}
                isError={isError}
                updateSchedule={(id, s, e) => {
                  updateSchedule(id, s, e);
                }}
                blueprintId={blueprintId}
                newSchedule={(s, e) => {
                  newSchedule(s, e);
                }}
                highlightYes
                startDate={startDate}
                endDate={endDate}
                setStartDate={(e) => {
                  setStartDate(e);
                }}
                setEndDate={(e) => {
                  setEndDate(e);
                }}
              >
                <div
                  className={`flex h-full cursor-pointer items-center gap-2 rounded p-2 text-white transition duration-300 hover:bg-green-600 focus:bg-green-600`}
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </DateScheduleDialog>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const DateScheduleDialog: React.FC<{
  children: React.ReactNode;
  description?: string;
  newSchedule: (startDate: Date, endDate: Date) => void;
  updateSchedule: (id: string, startDate: Date, endDate: Date) => void;
  lastSchedule: ScheduleHistory | undefined;
  no?: () => void;
  highlightYes?: boolean;
  highlightNo?: boolean;
  blueprintId: string;
  isLoading: boolean;
  isError: boolean;
  startDate: Date;
  endDate: Date;
  setStartDate: (e: Date) => void;
  setEndDate: (e: Date) => void;
}> = ({
  children,
  newSchedule,
  updateSchedule,
  no,
  highlightYes,
  highlightNo,
  isLoading,
  isError,
  lastSchedule,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [animationParent] = useAutoAnimate();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 top-0 z-30 backdrop-blur-lg data-[state=open]:animate-overlayShow md:bg-black/20" />
        {/* <div className="fixed top-0 data-[state=open]:animate-contentShow inset-0 z-30 flex items-center justify-center"> */}
        <Dialog.Content className="fixed left-[50%] top-[50%] z-30 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-black p-[25px] focus:outline-none data-[state=open]:animate-contentShow">
          <div ref={animationParent}>
            {isLoading && <LoadingSpinner />}
            {!isLoading && !isError && !lastSchedule ? (
              <>
                <Dialog.Title className="flex select-none items-center justify-start gap-2 text-2xl font-semibold text-zinc-200">
                  <CalendarDaysIcon className="inline-block h-6 w-6" />
                  <p>Schedule Date</p>
                </Dialog.Title>
                <Dialog.Description className="text-md select-none tracking-tight text-white">
                  Set a date range for a new schedule and click save.
                </Dialog.Description>
                <div className="my-2 flex w-full items-center justify-between border-y border-zinc-800 p-4">
                  <div>
                    <p className="text-lg font-semibold">From:</p>
                    <input
                      type="date"
                      value={startDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        setStartDate(new Date(e.target.value));
                      }}
                      className="rounded bg-zinc-800 p-2 outline-none ring-2 ring-zinc-700 transition duration-100 hover:ring hover:ring-zinc-600 focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                  <ArrowRightIcon className="h-6 w-6" />
                  <div>
                    <p className="text-lg font-semibold">To:</p>
                    <input
                      type="date"
                      value={endDate.toISOString().split("T")[0]}
                      onChange={(e) => {
                        setEndDate(new Date(e.target.value));
                      }}
                      className="rounded bg-zinc-800 p-2 outline-none ring-2 ring-zinc-700 transition duration-100 hover:ring hover:ring-zinc-600 focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button
                      onClick={() => {
                        no && no();
                      }}
                      className={`min-w-[3em] select-none rounded  p-2 text-center outline-none transition-all duration-100 ${
                        highlightNo
                          ? "bg-amber-700 hover:bg-amber-600 focus:bg-amber-600"
                          : "bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600"
                      } `}
                    >
                      Cancel
                    </button>
                  </Dialog.Close>

                  <Dialog.Close asChild>
                    <button
                      className={`min-w-[3em] select-none rounded  ${
                        highlightYes
                          ? "bg-amber-700 hover:bg-amber-600 focus:bg-amber-600"
                          : "bg-zinc-700 hover:bg-zinc-600 focus:bg-zinc-600"
                      } bg-gradient-to-br p-2 text-center outline-none transition-all duration-100`}
                      onClick={() => {
                        if (lastSchedule !== undefined) {
                          const sch = lastSchedule as ScheduleHistory;

                          updateSchedule(sch.id, startDate, endDate);
                        } else {
                          newSchedule(startDate, endDate);
                        }
                      }}
                    >
                      Save
                    </button>
                  </Dialog.Close>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <LoadingSpinner />
                Applying Changes...
              </div>
            )}
            {isError && (
              <>
                <Dialog.Title className="flex select-none items-center justify-start gap-2 text-2xl font-semibold text-zinc-200">
                  <CalendarDaysIcon className="inline-block h-6 w-6" />
                  <p>Schedule Date</p>
                </Dialog.Title>
                <Dialog.Description className="text-md select-none tracking-tight text-white">
                  Set a date range for a new schedule and click save.
                </Dialog.Description>
                <div className="px-2 py-10 italic text-red-500">
                  Error Loading Data. Please Try again later.
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
        {/* </div> */}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Ribbon;
