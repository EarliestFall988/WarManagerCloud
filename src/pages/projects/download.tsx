import type { Project } from "@prisma/client";
import type { NextPage } from "next";
import { useCallback, } from "react";
import { utils, writeFileXLSX, } from "xlsx";
import { LoadingPage, LoadingPage2, LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";
import { toast } from "react-hot-toast";

type DealType = {
  id: number;
  // creator_user_id: {
  //     id: number;
  //     name: string;
  //     email: string;
  //     has_pic: number;
  //     pic_hash: string;
  //     active_flag: boolean;
  //     value: number;
  // };
  // user_id: {
  //     id: number;
  //     name: string;
  //     email: string;
  //     has_pic: number;
  //     pic_hash: string;
  //     active_flag: boolean;
  //     value: number;
  // };
  // person_id: { //customer information ???
  //     active_flag: boolean;
  //     name: string;
  //     email: [
  //         {
  //             label: string;
  //             value: string;
  //             primary: boolean;
  //         }
  //     ];
  //     phone: [
  //         {
  //             label: string;
  //             value: string;
  //             primary: boolean;
  //         }
  //     ];
  //     value: number;
  // };
  // org_id: {
  //     name: string;
  //     people_count: number;
  //     owner_id: number;
  //     address: string;
  //     active_flag: boolean;
  //     cc_email: string;
  //     value: number;
  // };
  // stage_id: number;
  stageName: string;
  stage_pipelineName: string;
  stage_dealProbability: number;
  title: string;
  value: number;
  // // currency: string;
  add_time: string;
  update_time: string;
  stage_change_time: string;
  // active: boolean;
  // deleted: boolean;
  status: string; // <---crucial
  probability: number;
  next_activity_date: string;
  next_activity_time: string;
  next_activity_id: number;
  last_activity_id: number;
  last_activity_date: string;
  lost_reason: string;
  visible_to: string;
  close_time: string;
  pipeline_id: number; //pull the stage from here...?
  won_time: string; // need these??
  first_won_time: string; // need these??
  lost_time: string; // need these ??
  products_count: number; // blank column here that pulls the first 10 characters from the left side of the data in the next column
  files_count: number;
  notes_count: number;
  followers_count: number;
  email_messages_count: number;
  activities_count: number;
  done_activities_count: number;
  undone_activities_count: number;
  reference_activities_count: number;
  participants_count: number;
  expected_close_date: string;
  last_incoming_mail_time: string;
  last_outgoing_mail_time: string;
  label: number;
  stage_order_nr: number;
  person_name: string; // customer name ?? or owner name?
  org_name: string;
  next_activity_subject: string;
  next_activity_type: string;
  next_activity_duration: string;
  next_activity_note: string;
  formatted_value: string;
  weighted_value: number;
  formatted_weighted_value: string;
  weighted_value_currency: string;
  rotten_time: string;
  owner_name: string;
  cc_email: string;
  org_hidden: boolean;
  person_hidden: boolean;
}

// interface President {
//   Name: string;
//   Index: number;
// }

// const DownloadExample = () => {
//   /* the component state is an array of presidents */
//   const [pres, setPres] = useState<President[]>([]);

//   /* Fetch and update the state once */
//   useEffect(() => {
//     void (async () => {
//       const f = await (
//         await fetch("https://sheetjs.com/pres.xlsx")
//       ).arrayBuffer();
//       const wb = read(f); // parse the array buffer
//       const ws = wb.Sheets[wb.SheetNames[0] as string] as WorkSheet; // get the first worksheet
//       const data: President[] = utils.sheet_to_json(ws); // generate objects
//       setPres(data); // update state
//     })();
//   }, []);

//   /* get state data and export to XLSX */
//   const exportFile = useCallback(() => {
//     const ws = utils.json_to_sheet(pres);
//     const wb = utils.book_new();
//     utils.book_append_sheet(wb, ws, "Data");
//     writeFileXLSX(wb, "SheetJSReactAoO.xlsx");
//   }, [pres]);

//   return (
//     <table>
//       <thead>
//         <th>Name</th>
//         <th>Index</th>
//       </thead>
//       <tbody>
//         {
//           /* generate row for each president */
//           pres.map((p: President) => (
//             <tr key={p.Name}>
//               <td>{p.Name}</td>
//               <td>{p.Index}</td>
//             </tr>
//           ))
//         }
//       </tbody>
//       <tfoot>
//         <td colSpan={2}>
//           <button onClick={exportFile}>Export XLSX</button>
//         </td>
//       </tfoot>
//     </table>
//   );
// };


const DownloadProjectDetails = () => {
  const { data, isLoading, isError } = api.projects.download.useQuery();

  const DownloadAllCrewDetails = useCallback(() => {
    if (!data) return;

    const json = data.map((project: Project) => {
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

    console.log(json);

    const date = new Date();
    const dateString = `${date.getMonth() + 1
      }-${date.getDate()}-${date.getFullYear()}`;

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


// type DownloadPipeDriveDetails =
//   {
//     owner: string;
//     PrimaryEstimator: string;
//     SecondaryEstimator: string;
//     value: string;
//     stage: string;
//     status: string;
//     UpdateTime: string;
//     StatusUpdateTime: string; //merge won and lost into status time
//     StageUpdateTime: string;
//   }

const ReportingPage = () => {


  const { isSignedIn, isLoaded } = useUser();

  const { data, isLoading, isError } = api.reporting.getPipedriveDeals.useQuery();

  const handleDownloadPipedriveDeals = useCallback(() => {

    if (!data) {
      toast.error("No data to download");
      return;
    }

    // data?.data.forEach((deal: DealType) => {
    //     console.log(deal);
    // })

    const date = new Date();
    const dateString = `${date.getMonth() + 1
      }-${date.getDate()}-${date.getFullYear()}`;

    // console.log(json);
    // console.log(dateString);

    // console.log("data", data);





    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFileXLSX(wb, `Deals ${dateString}.xlsx`);

    toast.success("Downloaded data");

  }, [data])


  if (!isLoaded) {
    return <LoadingPage2 />
  }

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/reporting" />
  }

  if (isError) {
    return <div>error</div>
  }

  return (
    <>
      <div className="w-full h-full flex flex-col gap-2 justify-start items-start">
        <div className="flex flex-col items-start justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
          <h2 className="text-3xl font-semibold">Reporting</h2>
          <p className="text-md tracking-tight">This is the reporting page</p>
        </div>
        <div className="flex flex-col md:items-start gap-2 justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
          <h2 className="text-xl font-semibold">Pipe Drive</h2>
          <button onClick={handleDownloadPipedriveDeals} className="p-2 rounded bg-amber-700 hover:bg-amber-600 focus:bg-amber-600 duration-100 transition-all hover:scale-105">{"Download Data (XLSX)"}</button>
        </div>
      </div>
    </>
  )
}

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
      <main className="min-h-[100vh] bg-zinc-900">
        <NewItemPageHeader title="Download Projects" />
        <div className="m-auto flex w-full items-center justify-center p-2 sm:w-3/4">
          <ReportingPage />
        </div>
        <div className="m-auto flex w-full items-center justify-center p-2 sm:w-3/4">
          <DownloadProjectDetails />
        </div>
      </main>
    </>
  );
};

export default DownloadPage;
