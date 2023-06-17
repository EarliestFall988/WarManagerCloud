// import { getAuth } from "@clerk/nextjs/server";
// import { type NextApiRequest, type NextApiResponse } from "next";
// import Pusher, { type UserAuthResponse } from "pusher";


// type body = {
//     socket_id: string,
//     channel_name: string,
//     userId: string
// }

// export default function handler(req: NextApiRequest, res: NextApiResponse) {

//     if (req.method === "POST") {
//         const { socket_id, channel_name, userId } = req.body as body;

//         const { user, userId } = getAuth(req);

//         if (!user) {
//             res.status(401).end();
//             return;
//         }

//         // console.log("clerkAuth", clerkAuth)

//         const pusher = new Pusher({
//             appId: process.env.PUSHER_APP_ID || "",
//             key: process.env.PUSHER_APP_KEY || "",
//             secret: process.env.PUSHER_APP_SECRET || "",
//             cluster: process.env.PUSHER_APP_CLUSTER || "",
//             useTLS: true
//         });

//         const email = user.emailAddresses[0]?.emailAddress;

//         const firstname = user.firstName || "";
//         const lastname = user.lastName || "";

//         const presenceData = {
//             user_id: userId,
//             user_info: {
//                 fullname: firstname + " " + lastname,
//                 email
//             }
//         };

//         // const channelAuthResponse = pusher.authorizeChannel(socket_id, channel_name, presenceData);

//         const auth = pusher.authenticateUser(socket_id, {
//             id: userId,
//             name: presenceData.user_info.fullname,
//         });
//         res.send(auth);
//     }
//     else {
//         res.status(405).end();
//     }
// }