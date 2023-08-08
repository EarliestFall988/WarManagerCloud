import { type NextPage } from "next";
import React, { useEffect, useMemo, useCallback } from "react";
import { ViewMode, Gantt, type Task } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import Head from "next/head";
import { api } from "~/utils/api";
import { SwitchComponent } from "~/components/input";

const GanttPage: NextPage = () => {
  const { query } = useRouter();

  const id = (query.blueprintid || "") as string;

  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [viewString, setViewString] = React.useState<string>("day");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [isChecked, setIsChecked] = React.useState(true);

  const { data } = api.blueprints.getOneByIdWithScheduleInfo.useQuery({
    blueprintId: id,
  });

  useMemo(() => {
    if (data == undefined) return [];

    const projects = data.projects;

    const t = [] as Task[];

    projects.map((p, index) => {
      const start = new Date();
      const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5);

      const project = {
        start,
        end,
        name: p.name,
        id: p.id,
        progress: p.percentComplete,
        type: "project",
        hideChildren: false,
        displayOrder: index + 1,
      } as Task;
      t.push(project);

      p.crew.map((c) => {
        const crew = {
          start,
          end,
          name: c.name,
          id: c.id,
          progress: 0,
          type: "task",
          hideChildren: false,
          displayOrder: index + 1,
          project: p.id,
        } as Task;

        t.push(crew);
      });
    });

    if (tasks.length == 0) setTasks(t);
  }, [data, tasks]);

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

  return (
    <>
      <Head>
        <title>Time Scheduling for {data?.name} | War Manager</title>
      </Head>
      <main className="no-global-styles">
        <div className="min-h-[100vh] w-full bg-zinc-800 text-black">
          <div className="flex w-full items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={Back}
                className="rounded border border-zinc-600 bg-zinc-700 p-2 px-3 text-zinc-100 transition duration-200 hover:border-amber-600 hover:bg-zinc-600 focus:border-amber-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <h2 className="text-large font-semibold text-white">
                {data?.name} - Time Scheduling
              </h2>
            </div>
            <div className="flex gap-2">
              <SwitchComponent
                className="rounded border border-zinc-600 bg-zinc-700 p-2 px-3 transition duration-200 hover:border-amber-600 hover:bg-zinc-600 focus:border-amber-600"
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
                className="w-40 rounded border border-zinc-600 bg-zinc-700 text-zinc-100 outline-none transition duration-200 hover:border-amber-600 hover:bg-zinc-600 focus:border-amber-600"
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <button className="flex items-center justify-start gap-2 rounded border border-transparent bg-green-600 p-2 font-semibold text-zinc-200 transition duration-200 hover:scale-105 hover:border-zinc-300 hover:bg-green-500 focus:bg-green-500  ">
                <p>Next</p>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {tasks.length > 0 && (
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
          )}
        </div>
      </main>
    </>
  );
};

// function useTasks(blueprintId: string) {
//   const { data } = api.blueprints.getOneByIdWithScheduleInfo.useQuery({
//     blueprintId,
//   });

//   useMemo(() => {
//     if (data == undefined) return [];

//     const projects = data.projects;

//     const t = [] as Task[];

//     projects.map((p) => {
//       const project = {
//         start: new Date(),
//         end: new Date(),
//         name: p.name,
//         id: p.id,
//         progress: p.percentComplete,
//         type: "project",
//         hideChildren: false,
//         displayOrder: 1,
//       } as Task;
//       t.push(project);
//     });

//     setTasks(t);
//   }, [data]);

//   console.log(tasks);

// const currentDate = new Date();
// tasks: Task[] = [
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//     name: "Some Project",
//     id: "ProjectSample",
//     progress: 25,
//     type: "project",
//     hideChildren: false,
//     displayOrder: 1,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
//     end: new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       2,
//       12,
//       28
//     ),
//     name: "Idea",
//     id: "Task 0",
//     progress: 45,
//     type: "task",
//     project: "ProjectSample",
//     displayOrder: 2,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
//     name: "Research",
//     id: "Task 1",
//     progress: 25,
//     // dependencies: ["Task 0"],
//     type: "task",
//     project: "ProjectSample",
//     displayOrder: 3,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
//     name: "Discussion with team",
//     id: "Task 2",
//     progress: 10,
//     dependencies: ["Task 1"],
//     type: "task",
//     project: "ProjectSample",
//     displayOrder: 4,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
//     name: "Developing",
//     id: "Task 3",
//     progress: 2,
//     dependencies: ["Task 2"],
//     type: "task",
//     project: "ProjectSample",
//     displayOrder: 5,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
//     name: "Review",
//     id: "Task 4",
//     type: "task",
//     progress: 70,
//     dependencies: ["Task 2"],
//     project: "ProjectSample",
//     displayOrder: 6,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//     name: "Release",
//     id: "Task 6",
//     progress: currentDate.getMonth(),
//     type: "milestone",
//     dependencies: ["Task 4"],
//     project: "ProjectSample",
//     displayOrder: 7,
//   },
//   {
//     start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
//     end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
//     name: "Party Time",
//     id: "Task 9",
//     progress: 0,
//     isDisabled: true,
//     type: "task",
//   },
// ];
//   return tasks;
// }

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
