import {
  CloudArrowUpIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import { type Equipment, type CrewMember, type Project } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { api } from "~/utils/api";

import { useMemo, useState } from "react";

type projectCrewType = {
  project: Project;
  crew: crewType[];
  equipment: equipmentType[];
};

type crewType = CrewMember & { start: Date; end: Date };
type equipmentType = Equipment & { start: Date; end: Date };

const CommitPage: NextPage = () => {
  const router = useRouter();

  const { blueprintid } = router.query;

  const id = blueprintid as string | undefined;

  const { data } = api.blueprints.getOneByIdWithScheduleInfo.useQuery({
    blueprintId: id || "",
  });

  const [schedule, setSchedule] = useState<projectCrewType[]>([]);

  useMemo(() => {
    const scheduleHistories = data?.scheduleHistories[0];

    if (scheduleHistories === undefined || scheduleHistories === null) return;

    const scheduleItems = scheduleHistories.ScheduleHistoryItems;

    const schedule = [] as projectCrewType[];

    scheduleItems.map((scheduleItem) => {
      const project = scheduleItem.project;

      if (
        schedule.find((item) => item.project.id === project.id) === undefined
      ) {
        schedule.push({
          project: project,
          crew: [] as crewType[],
          equipment: [] as equipmentType[],
        });
      }

      const crewMember = scheduleItem.crew;
      const equipment = scheduleItem.equipment;

      const projectIndex = schedule.findIndex(
        (item) => item.project.id === project.id
      );

      if (crewMember !== null && crewMember !== undefined) {
        schedule[projectIndex]?.crew.push({
          ...crewMember,
          start: new Date(scheduleItem.startTime),
          end: new Date(scheduleItem.endTime),
        });
      }

      if (equipment !== null && equipment !== undefined) {
        schedule[projectIndex]?.equipment.push({
          ...equipment,
          start: new Date(scheduleItem.startTime),
          end: new Date(scheduleItem.endTime),
        });
      }
    });

    setSchedule(schedule);
  }, [data]);

  return (
    <>
      <Head>
        {data?.name && (
          <title>Commit Schedule using {data?.name || ""} | War Manager</title>
        )}
        {!data?.name && <title>Loading Commit Schedule... | War Manager</title>}
      </Head>
      <main className="min-h-[100vh] w-full bg-zinc-900">
        <NewItemPageHeader
          title={data?.name ? `${data?.name} Blueprint Schedule` : "Commit"}
          context="blueprints"
        />
        <div className="flex flex-col items-center justify-start">
          <div className="w-1/2">
            {schedule.map((s) => (
              <div className="w-full  p-2" key={s.project.id}>
                <div className="flex items-center justify-start gap-2 rounded bg-zinc-800 p-2">
                  <WrenchScrewdriverIcon className="h-6 w-6" />
                  <div>
                    <p className="text-2xl font-semibold">
                      {s.project?.name || ""}
                    </p>
                    <p className="text-md">{s.project?.address || ""}</p>
                  </div>
                </div>

                {s.crew.map((crew) => (
                  <div
                    key={crew.id}
                    className="flex w-full items-center justify-between gap-2 border-b border-zinc-800 p-1"
                  >
                    <div className="text-md flex w-full items-center justify-start gap-2">
                      <UserCircleIcon className="h-6 w-6 text-zinc-200" />
                      <div>
                        <p>{crew?.name || ""}</p>
                        <p className="text-sm text-zinc-200">
                          {crew?.phone || ""}
                        </p>
                      </div>
                    </div>
                    <p className="w-1/2">
                      {crew.start.toDateString()}
                      {" - "}
                      {crew.end.toDateString()}
                    </p>
                  </div>
                ))}
                {s.equipment.map((e) => (
                  <div key={e.id} className="text-md pb-1">
                    <p>{e?.name || ""}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="h-20" />
          <button className="flex w-1/2 items-center justify-center gap-1 rounded bg-amber-700 p-2 font-semibold transition duration-100 hover:bg-amber-600">
            Commit Changes
            <CloudArrowUpIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="h-20" />
      </main>
    </>
  );
};

export default CommitPage;
