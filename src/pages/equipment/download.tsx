import type { NextPage } from "next";
import { useCallback } from "react";
import { utils, writeFileXLSX } from "xlsx";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

// import dayjs from "dayjs";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";

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

const DownloadEquipmentDetails = () => {
  const { data, isLoading, isError } = api.equipment.getAll.useQuery();

  const DownloadEquipmentDetails = useCallback(() => {
    if (!data) return;

    const json = data.map((e) => {
      return {
        name: e.name,
        "identification #": e.equipmentId,
        type: e.type,
        condition: e.condition,
        costPerHour: e.costPerHour,
        gpsLink: e.gpsURL ? `=HYPERLINK("${e.gpsURL}")` : "",
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
    writeFileXLSX(wb, `Equipment List ${dateString}.xlsx`);
  }, [data]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-1">
      {isLoading && <LoadingSpinner />}
      {isError && <p>Error</p>}
      {data && (
        <>
          <button
            className=" flex w-full items-center justify-center gap-1 rounded bg-gradient-to-r from-amber-700 to-red-700 p-2"
            onClick={DownloadEquipmentDetails}
          >
            Download
            <ArrowDownCircleIcon className="h-6 w-6" />
          </button>
          <div className="w-full border-t border-zinc-700">
            <div className="grid w-full grid-cols-7 gap-2 border-x border-b border-zinc-600 bg-zinc-600 p-2 text-zinc-100 hover:bg-zinc-500">
              <p className="w-full truncate font-semibold">Name</p>
              <p className="w-full truncate font-semibold">Identification #</p>
              <p className="w-full truncate font-semibold">Type</p>
              <p className="w-full truncate font-semibold">Condition</p>
              <p className="w-full truncate font-semibold">Cost Per Hour</p>
              <p className="w-full truncate font-semibold">GPS URL</p>
            </div>

            {data.map((crewMember) => (
              <div
                className="text-thin grid w-full grid-cols-7 gap-2 border-x border-b border-zinc-600 p-2 tracking-tight text-zinc-100 hover:bg-zinc-700"
                key={crewMember.id}
              >
                <p className="text-thin w-full truncate tracking-tight">
                  {crewMember.name}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {crewMember.equipmentId}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {crewMember.type}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  {crewMember.condition}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  ${crewMember.costPerHour.toFixed(2)}
                </p>
                <p className="text-thin w-full truncate tracking-tight">
                  $
                  {crewMember.gpsURL
                    ? `=HYPERLINK("${crewMember.gpsURL}")`
                    : ""}
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
        <SignInModal redirectUrl="/equipment/download" />
      </>
    );

  return (
    <>
      <main className="min-h-[100vh] bg-zinc-900">
        <NewItemPageHeader title="Download Equipment" />
        <div className="m-auto flex w-full items-center justify-center p-2 sm:w-3/4">
          <DownloadEquipmentDetails />
        </div>
      </main>
    </>
  );
};

export default DownloadPage;
