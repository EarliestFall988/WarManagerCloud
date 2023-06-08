import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { read, utils, writeFileXLSX, type WorkSheet } from "xlsx";

interface President {
  Name: string;
  Index: number;
}

const Download = () => {
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

const UploadPage: NextPage = () => {
  return <Download />;
};

export default UploadPage;
