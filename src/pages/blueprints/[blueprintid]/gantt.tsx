import { type NextPage } from "next";
import React, { useEffect, useCallback } from "react";
import { ViewMode, Gantt, type Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import Head from "next/head";
import { api } from "~/utils/api";
import { SwitchComponent } from "~/components/input";
import TooltipComponent from "~/components/Tooltip";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  type CrewMember,
  type Equipment,
  type Project,
  type ScheduleHistoryItem,
} from "@prisma/client";
import { LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";

type ScheduleItemType = ScheduleHistoryItem & {
  project: Project;
  crew: CrewMember | null;
  equipment: Equipment | null;
};

const GanttPage: NextPage = () => {
  const { query } = useRouter();

  const id = (query.blueprintid || "") as string;

  const [animationSaveParent] = useAutoAnimate();

  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [viewString, setViewString] = React.useState<string>("day");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isChecked, setIsChecked] = React.useState(true);
  const [scheduleData, setScheduleData] = React.useState<ScheduleItemType[]>();

  const blueprintContext = api.useContext().blueprints;
  const timeScheduleContext = api.useContext().timeScheduling;

  const { data, isLoading, isError } =
    api.blueprints.getOneByIdWithScheduleInfo.useQuery({
      blueprintId: id,
    });

  if (scheduleData === undefined && data !== undefined) {
    setScheduleData(data?.scheduleHistories[0]?.ScheduleHistoryItems);
  }

  const {
    mutate: UpdateTimeScheduleItems,
    isLoading: isSavingChanges,
    isError: errorSavingChanges,
  } = api.timeScheduling.updateTimeSchedules.useMutation({
    onSuccess: (data) => {
      console.log(data);
      void blueprintContext.invalidate();
      void timeScheduleContext.invalidate();
    },
    onError: (e) => {
      console.log(e);
      toast.error("Error saving changes");
    },
  });

  useEffect(() => {
    if (scheduleData == undefined || scheduleData.length === 0) return;

    const latestScheduleHistory = scheduleData;

    const t = [] as Task[];

    latestScheduleHistory?.map((p) => {
      const start = new Date(new Date(p.startTime));
      const end = new Date(new Date(p.endTime));
      // new Date(p.endTime) || new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);

      const proj = p.project;

      if (!t.find((b) => b.id === proj.id)) {
        const project = {
          start,
          end,
          name: proj.name,
          id: proj.id,
          progress: proj.percentComplete,
          type: "project",
          hideChildren: false,
          displayOrder: 0,
        } as Task;

        t.push(project);
      }
    });

    latestScheduleHistory?.map((p) => {
      const start = new Date(new Date(p.startTime));
      const end = new Date(new Date(p.endTime));

      if (p.crew !== undefined && p.crew !== null) {
        const crew = {
          start,
          end,
          name: `${p.crew.name}`,
          id: `${p.crew.id}:${p.project.id}}`,
          progress: 0,
          type: "task",
          hideChildren: false,
          displayOrder: 0,
          project: p.project.id,
        } as Task;

        const loc = t.findIndex((b) => b.id === p.project.id);

        if (loc > -1) {
          t.splice(loc + 1, 0, crew);
        }
      }

      if (p.equipment !== undefined && p.equipment !== null) {
        const equipment = {
          start,
          end,
          name: p.equipment.name,
          id: p.equipment.id,
          progress: 0,
          type: "task",
          hideChildren: false,
          displayOrder: 0,
          project: p.project.id,
        } as Task;

        const loc = t.findIndex((b) => b.id === p.project.id);

        if (loc > -1) {
          t.splice(loc + 1, 0, equipment);
        }
      }
    });

    setTasks(t);
  }, [scheduleData, data]);

  let columnWidth = 65;

  const router = useRouter();

  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  useEffect(() => {
    switch (view) {
      case ViewMode.Year:
        setViewString("year");
        break;
      case ViewMode.Month:
        setViewString("month");
        break;
      case ViewMode.QuarterDay:
        setViewString("daily");
        break;
      case ViewMode.Week:
        setViewString("week");
        break;
      case ViewMode.Day:
        setViewString("day");
        break;
    }
  }, [view]);

  const HandleSetViewString = useCallback((view: string) => {
    switch (view) {
      case "year":
        setView(ViewMode.Year);
        break;
      case "month":
        setView(ViewMode.Month);
        break;
      case "week":
        setView(ViewMode.Week);
        break;
      case "hour":
        setView(ViewMode.QuarterDay);
        break;
      case "day":
        setView(ViewMode.Day);
        break;
    }
  }, []);

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project =
        newTasks[newTasks.findIndex((t) => t.id === task.project)];

      if (
        project == undefined ||
        project == null ||
        project.id == undefined ||
        project.id == null ||
        start == undefined ||
        start == null ||
        end == undefined ||
        end == null
      ) {
        return;
      }

      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };

        newTasks = newTasks.map((t) =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  const Back = () => {
    if (window.history.length > 0) router.back();
    else void router.push("/dashboard/blueprints");
  };

  const SaveChanges = useCallback(() => {
    if (data == undefined) return;

    const result = [] as ScheduleHistoryItem[];

    const scheduleHistories = data.scheduleHistories;
    const latestScheduleHistory = scheduleHistories[0]?.ScheduleHistoryItems;

    if (latestScheduleHistory == undefined) return;

    console.log("tasks", tasks);

    tasks.map((task) => {
      if (task.type === "task") {
        latestScheduleHistory?.find((history) => {
          const taskId = task.id?.split(":")[0];
          if (
            history.crewId === taskId &&
            !result.find((item) => item.id === history.id)
          )
            result.push({
              ...history,
              startTime: task.start.toISOString(),
              endTime: task.end.toISOString(),
            });
        });
      }
    });

    const res = result.map((item) => {
      return {
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        projectId: item.projectId,
        crewId: item.crewId?.split(":")[0] || undefined,
        equipmentId: item.equipmentId || undefined,
        notes: "",
      };
    });

    console.log("result1", res);

    UpdateTimeScheduleItems(res);
  }, [data, tasks, UpdateTimeScheduleItems]);

  return (
    <>
      <Head>
        {data?.name && (
          <title>Time Scheduling for {data?.name} | War Manager</title>
        )}
        {!data?.name && <title>Time Scheduling | War Manager</title>}
      </Head>
      <main className="no-global-styles">
        <div className="min-h-[100vh] w-full bg-zinc-800 text-black">
          <div className="fixed top-0 z-20 flex w-full items-center justify-between border-b border-zinc-600 bg-zinc-800/90 p-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                onClick={Back}
                className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              {data?.name && (
                <h2 className="text-large font-semibold text-white">
                  {data?.name} - Time Scheduling
                </h2>
              )}
              {!data?.name && (
                <h2 className="text-large font-semibold text-white">
                  Time Scheduling
                </h2>
              )}
            </div>
            <div className="flex gap-2">
              <SwitchComponent
                onCheckedChange={(e) => {
                  setIsChecked(e);
                }}
                checked={isChecked}
              >
                <ListBulletIcon className="h-6 w-6 text-white" />
              </SwitchComponent>
              <select
                value={viewString}
                onChange={(e) => {
                  HandleSetViewString(e.target.value);
                }}
                className="w-40 rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:bg-zinc-500"
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <TooltipComponent
                content="Save changes to the Cloud"
                side="bottom"
                disableToolTipIfNoContent={true}
              >
                <button
                  className="rounded bg-zinc-600 bg-gradient-to-br p-2 text-white transition-all duration-100 hover:scale-105 hover:bg-zinc-500"
                  onClick={SaveChanges}
                >
                  <div ref={animationSaveParent}>
                    {!isSavingChanges && (
                      <CloudArrowUpIcon className="h-6 w-6" />
                    )}
                    {isSavingChanges && (
                      <div className="flex flex-col-reverse items-center justify-center sm:flex-row sm:gap-2">
                        <ArrowPathIcon className="h-6 w-6 animate-spin rounded-full text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </TooltipComponent>
              <button className="flex items-center justify-start gap-2 rounded bg-green-600 p-2 font-semibold text-zinc-200 transition duration-200 hover:scale-105  hover:bg-green-500 focus:bg-green-500  ">
                <CalendarIcon className="h-6 w-6" />
                <p>Commit Schedule</p>
              </button>
            </div>
          </div>
          {tasks.length > 0 && !isSavingChanges && (
            <>
              <div className="h-16 bg-zinc-800" />
              <div className="bg-white">
                <Gantt
                  tasks={tasks}
                  viewMode={view}
                  onDateChange={handleTaskChange}
                  onDelete={handleTaskDelete}
                  onProgressChange={handleProgressChange}
                  onDoubleClick={handleDblClick}
                  onClick={handleClick}
                  onSelect={handleSelect}
                  onExpanderClick={handleExpanderClick}
                  listCellWidth={isChecked ? "155px" : ""}
                  columnWidth={columnWidth}
                />
              </div>
            </>
          )}
          {(isSavingChanges || isLoading) && (
            <div className="flex min-h-[105vh] w-full items-center justify-center bg-zinc-900 text-white">
              <LoadingSpinner />
            </div>
          )}
          {tasks.length === 0 && !isSavingChanges && !isLoading && (
            <div className="flex min-h-[105vh] w-full flex-col items-center justify-center gap-2 bg-zinc-900  text-white">
              <p className="text-lg font-semibold">Nothing to schedule</p>
              <button className="flex items-center justify-center gap-1 rounded bg-zinc-700 p-2 transition duration-100 hover:bg-zinc-600 focus:bg-zinc-600">
                <ArrowLeftIcon className="h-5 w-5" />
                <p>Back</p>
              </button>
            </div>
          )}
          {isError && errorSavingChanges && (
            <div className="flex min-h-[105vh] w-full flex-col items-center justify-center gap-2 bg-zinc-900  text-white">
              <p className="text-lg font-semibold">
                There was an error. Try again later.
              </p>
              <button className="flex items-center justify-center gap-1 rounded bg-zinc-700 p-2 transition duration-100 hover:bg-zinc-600 focus:bg-zinc-600">
                <ArrowLeftIcon className="h-5 w-5" />
                <p>Back</p>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter((t) => t.project === projectId);

  if (projectTasks.length === 0) return [null, null];

  let start = projectTasks[0]?.start;
  let end = projectTasks[0]?.end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if ((start?.getTime() || 0) > (task?.start?.getTime() || 0)) {
      start = task?.start;
    }
    if ((end?.getTime() || 0) < (task?.end?.getTime() || 0)) {
      end = task?.end;
    }
  }
  return [start, end];
}

export default GanttPage;
