// import type { NextPage } from "next";
// import { useEffect, useState } from "react";
// import { api } from "~/utils/api";
// import React from "react";
// import Pusher, { type Channel } from "pusher-js";
// import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
// import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
// import SignInModal from "~/components/signInPage";
// import { useRouter } from "next/router";
// import { toast } from "react-hot-toast";
// import { LoadingSpinner } from "~/components/loading";


// interface IMessage {
//   message: string;
// }

// type ChannelError = {
//   type: string;
//   error: string;
//   status: number;
// }

// // const PusherComponent: React.FC<{ channelName: string, setPusherChannel: React.Dispatch<React.SetStateAction<Channel | null>> }> = ({ channelName, setPusherChannel }) => {

// //   // const { isSignedIn } = useUser();
// //   const [context, setContext] = useState<string>("");
// //   const [isConnected, setIsConnected] = useState<boolean>(true);


// //   useEffect(() => {

// //     // if (!isSignedIn) {
// //     //   console.log("not signed in");
// //     //   return;
// //     // }
// //     // else {
// //     //   console.log("signed in");
// //     // }

// //     if (!channelName) {
// //       console.log("no channel name");
// //       return;
// //     }

// //     // console.log("channelName", channelName);

// //     const pusher = new Pusher("848a626dcb2145f64ca1", {
// //       cluster: "us2",
// //       userAuthentication: {
// //         endpoint: "/api/pusher/user-auth", // contact the correct endpoints
// //         transport: "ajax",
// //       },
// //       channelAuthorization: {
// //         endpoint: "/api/pusher/channel-auth", //contact the correct endpoints
// //         transport: "ajax",
// //       }
// //     });

// //     pusher.signin(); // sign in the user


// //     const ch = pusher.subscribe(channelName); // subscribe to the channel

// //     ch.bind('pusher:subscription_succeeded', function (members: Members) {
// //       console.log("members", members);
// //       setContext("connected!");
// //       setIsConnected(true);
// //     });


// //     ch.bind("pusher:subscription_error", (error: ChannelError) => {
// //       console.log("error", error);
// //       if (error.type = "AuthError") {
// //         setContext("Sorry! You are not authorized to access this resource. If you are supposed to have access, try logging out and back in.");
// //       }
// //       else {
// //         setContext("Sorry! There was an error - try again later. If this keeps happening, contact support.");
// //       }
// //       setIsConnected(false);
// //     });

// //     ch.bind('pusher:member_added', function (member: Members) {

// //       console.log(member.count);

// //     });

// //     ch.bind('pusher:member_removed', function (member: Members) {
// //       console.log(member.count);
// //     });

// //     setPusherChannel(ch);


// //     return () => {
// //       console.log("unsubscribing")
// //       pusher.unsubscribe(channelName);
// //       pusher.disconnect();
// //     }
// //   }, [])

// //   // return { channel, context, isConnected };
// // }



// const ActivityPage: NextPage = () => {
//   const [text, setText] = useState<string>("");
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [data, setData] = useState<string>("");
//   const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);

//   const { isLoaded: userLoading, isSignedIn } = useUser();

//   const eventName = "event";

//   const { query } = useRouter();

//   const queryChannel = query.channel as string | undefined;
//   const fullChannelName = `presence-${queryChannel || ""}`
//   // const { context, isConnected } = useChannel(`presence-${queryChannel || ""}`, setPusherChannel);

//   // TRIGGERED ON MOUNT
//   useEffect(() => {

//     const pusher = new Pusher("848a626dcb2145f64ca1", {
//       cluster: "us2",
//       userAuthentication: {
//         endpoint: "/api/pusher/user-auth", // contact the correct endpoints
//         transport: "ajax",
//       },
//       channelAuthorization: {
//         endpoint: "/api/pusher/channel-auth", //contact the correct endpoints
//         transport: "ajax",
//       }
//     });


//     const channel = pusher.subscribe(fullChannelName);
//     setPusherChannel(channel);

//     console.log("Updated data : ", data);
//     if (pusherChannel && pusherChannel.bind) {
//       console.log("Unbinding Event");
//       pusherChannel.unbind(eventName);
//       console.log("Rebinding Event");
//       pusherChannel.bind(eventName, (pusherData: string) => {
//         // USE UPDATED "data" here
//         console.log("pusherData", pusherData);
//       });
//     }

//     pusher.unsubscribe(fullChannelName);
//     pusher.disconnect();

//     return () => {
     
//     };
//   }, [pusherChannel, data, fullChannelName]);




//   // useEffect(() => {

//   //   if (!isSignedIn) return;

//   //   //counts as a connection. max 100 connections. 1 connection per user


//   //   const blueprintChannel = query.channel as string;

//   //   setBlueprintChannelName(`presence-${blueprintChannel}`);

//   //   const channel = pusher.subscribe(blueprintChannelName);

//   //   channel.bind(eventName, (data: IMessage) => {
//   //     setMessages([...messages, data]);
//   //   });

//   //   return () => {
//   //     pusher.unsubscribe(blueprintChannelName);
//   //     pusher.disconnect(); // I think this will remove the disconnection limit issue
//   //   };
//   // }, []);


//   const { mutate } = api.development.sendMessage.useMutation({
//     onSuccess: (data) => {
//       // console.log("data", data);
//       setText("");
//       toast.success("Message sent");
//     },

//     onError: (error) => {
//       console.log("error", error);
//       toast.error("error" + error.message);
//     }
//   });

//   const addMessage = (message: string) => {
//     // setMessages((messages) => [...messages, message]);
//     if (pusherChannel === null) return;
//     mutate({ message, channel: pusherChannel.name, event: eventName });
//   };

//   if (!isSignedIn && !userLoading) return <SignInModal redirectUrl="/development/activity" />;

//   if (!pusherChannel) return <LoadingSpinner />

//   // if (userLoading) return <LoadingPage />;

//   // if (!isConnected) {
//   //   return (
//   //     <main className="flex min-h-[100vh] gap-4 items-center justify-center bg-cover bg-center flex-col">
//   //       <p>{context}</p>
//   //     </main>
//   //   )
//   // }

//   return (
//     <main className="flex min-h-[100vh] gap-4 items-center justify-center bg-cover bg-center flex-col">
//       {isSignedIn && <SignOutButton />}
//       {!isSignedIn && <SignInButton />}

//       <div className="flex h-[80vh] w-10/12 flex-col justify-between rounded border border-zinc-600 bg-zinc-700 p-2 shadow-md sm:w-1/3">
//         <h1 className="w-full border-b border-zinc-600 text-lg font-semibold">
//           Activity - {pusherChannel?.name}
//         </h1>
//         <div>
//           {/* <div className="flex h-[50vh] flex-col gap-2 overflow-y-auto truncate bg-red-500"> */}
//           {messages.map((message, index) => (
//             <div key={index} className="flex flex-col">
//               <p className="py-1 text-sm text-zinc-400">{message.message}</p>
//             </div>
//           ))}
//           {/* </div> */}

//           <div className="flex gap-2 pt-1">
//             <input
//               type="text"
//               className="w-full rounded border border-zinc-500 bg-zinc-600 p-2 outline-none focus:ring-2 focus:ring-amber-600"
//               value={text}
//               onChange={(e) => setText(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   addMessage(text);
//                 }
//               }}
//             />
//             <button
//               className="rounded border border-zinc-600 bg-amber-600 p-2 shadow-md"
//               onClick={() => addMessage(text)}
//             >
//               <PaperAirplaneIcon className="h-5 w-5 text-zinc-50" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default ActivityPage;
