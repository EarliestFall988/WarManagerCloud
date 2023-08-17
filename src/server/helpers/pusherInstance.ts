import { clerkClient } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { type NextApiRequest } from "next";
// import Pusher from "pusher";

// export const GetPusher = () => {
//   const pusher = new Pusher({
//     appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID || "",
//     key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
//     secret: process.env.NEXT_PUBLIC_PUSHER_SECRET || "",
//     cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
//     useTLS: true,
//   });

//   return pusher;
// };

type userDataType = {
  id: string;
  user_info: {
    email: string;
    name: string;
    avatar: string;
  };
};

export const handleAuth = async (req: NextApiRequest) => {
  const { userId } = getAuth(req);

  if (!userId) return null;

  const user = await clerkClient.users.getUser(userId);

  if (!user) return;

  if (user.banned) return null;

  const fName = user.firstName || "";
  const lName = user.lastName || "";

  const userData: userDataType = {
    id: userId,
    user_info: {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: fName + " " + lName,
      avatar: user.profileImageUrl,
    },
  };

  return userData;
};

export const ctx = async (req: NextApiRequest) => {
  const data = await handleAuth(req);
  // const pusher = GetPusher();

  return { pusher: null, userData: data };
};
