import { CrewMember, Project } from "@prisma/client";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { read, utils, writeFileXLSX, type WorkSheet } from "xlsx";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { SignedIn, SignedOut } from "@clerk/nextjs/dist/components.server";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";

interface President {
  Name: string;
  Index: number;
}

const DownloadExample = () => {
  /* the component state is an array of presidents */
  const [pres, setPres] = useState<President[]>([]);

  /* Fetch and update the state once */
  useEffect(() => {
    void (async () => {
      const f = await (
        await fetch("https://sheetjs.com/pres.xlsx")
      ).arrayBuffer();
      const wb = read(f); // parse the array buffer
      const ws = wb.Sheets[wb.SheetNames[0] as string] as WorkSheet; // get the first worksheet
      const data: President[] = utils.sheet_to_json(ws); // generate objects
      setPres(data); // update state
    })();
  }, []);

  /* get state data and export to XLSX */
  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(pres);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, "SheetJSReactAoO.xlsx");
  }, [pres]);

  return (
    <table>
      <thead>
        <th>Name</th>
        <th>Index</th>
      </thead>
      <tbody>
        {
          /* generate row for each president */
          pres.map((p: President) => (
            <tr key={p.Name}>
              <td>{p.Name}</td>
              <td>{p.Index}</td>
            </tr>
          ))
        }
      </tbody>
      <tfoot>
        <td colSpan={2}>
          <button onClick={exportFile}>Export XLSX</button>
        </td>
      </tfoot>
    </table>
  );
};


const DownloadProjectDetails = () => {
  const { data, isLoading, isError } = api.projects.download.useQuery();

  const DownloadAllCrewDetails = useCallback(() => {
    if (!data) return;

    const json  = data.map((project: Project) => {
      return {
        name: project.name,
        address: project.address,
        city: project.city,
        state: project.state,
        start_date: dayjs(project.startDate).format("MM-DD-YYYY"),
        end_date: dayjs(project.endDate).format("MM-DD-YYYY"),
        status: project.status,
        notes_or_concerns: project.notes,
      };
    });

    const date = new Date();
    const dateString = `${
      date.getMonth() + 1
    }-${date.getDate()}-${date.getFullYear()}`;

    // console.log(json);
    // console.log(dateString);

    const ws = utils.json_to_sheet(json);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, `List of Projects ${dateString}.xlsx`);
  }, [data]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-1">
      {isLoading && <LoadingSpinner />}
      {isError && <p>Error</p>}
      {data && (
        <>
          <button
            className=" flex w-full items-center justify-center gap-1 rounded bg-gradient-to-r from-amber-700 to-red-700 p-2"
            onClick={DownloadAllCrewDetails}
          >
            Download
            <ArrowDownCircleIcon className="h-6 w-6" />
          </button>
          <div className="w-full border-t border-zinc-700">
            <div className="grid w-full grid-cols-8 gap-2 border-x border-b border-zinc-600 bg-zinc-600 p-2 text-zinc-100 hover:bg-zinc-500">
              <p className="w-full truncate font-semibold">Name</p>
              <p className="w-full truncate font-semibold">Address</p>
              <p className="w-full truncate font-semibold">City</p>
              <p className="w-full truncate font-semibold">State</p>
              <p className="w-full truncate font-semibold">Start Date</p>
              <p className="w-full truncate font-semibold">End Date</p>
              <p className="w-full truncate font-semibold">Status</p>
              <p className="w-full truncate font-semibold">Notes/Concerns</p>
            </div>

            {data.map((project) => (
              <div
                className="text-thin grid w-full grid-cols-8 gap-2 border-x border-b border-zinc-600 p-2 tracking-tight text-zinc-100 hover:bg-zinc-700"
                key={project.id}
              >
                <p className="text-thin w-full truncate tracking-tight">
                  {project.name}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {project.address}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {project.city}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {project.state}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {dayjs(project.startDate).format("MM-DD-YYYY")}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {dayjs(project.endDate).format("MM-DD-YYYY")}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {project.status}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {project.notes}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DownloadPage: NextPage = () => {
  const { user } = useUser();

  if (!user)
    return (
      <>
        <SignInModal redirectUrl="/dashboard" />
      </>
    );

  return (
    <>
      <main className="min-h-[100vh] bg-zinc-800">
        <NewItemPageHeader title="Download Projects" context="projects" />
        <div className="m-auto flex w-full items-center justify-center p-2 sm:w-3/4">
          <DownloadProjectDetails />
        </div>
      </main>
    </>
  );
};

export default DownloadPage;
