// import { IncomingForm, type Fields, type Files, type File } from "formidable";
// import { type NextApiResponse, type NextApiRequest } from "next";
// import XLSX from "xlsx";

import { type NextApiRequest, type NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

// type res =
//   | {
//       fields: Fields;
//       files: Files;
//     }
//   | unknown;

export const handler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log("req: ", req);
  res.status(200);
}

// export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const data = await new Promise((resolve, reject) => {
//     if (req.method !== "POST")
//       return res.status(400).json({ error: "Only POST requests are allowed" });

//     const form = new IncomingForm();

//     void form.parse(req, (err, fields, files) => {
//       if (err) return reject(err);
//       resolve({ fields, files });
//     }) as res;
//   }).then((data) => data as { fields: Fields; files: Files });

//   const { files } = data;

//   const { f } = files;

//   if (!f) {
//     res.status(400).json({ error: "No file was uploaded" });
//     return;
//   }

  

//   console.log("result", f[0]?.toJSON());

//   const workbook = XLSX.read(f[0]);

//   console.log(workbook);

//   res.status(200).json({ name: "John Doe" });
// };

// export default handler;
