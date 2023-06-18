import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import React from "react";
import Pusher from "pusher-js";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";

interface IMessage {
  message: string;
}

const ActivityPage: NextPage = () => {
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const { user, isLoaded: userLoading, isSignedIn } = useUser();

  const channelName = "channel";
  const eventName = "event";

  useEffect(() => {
    const pusher = new Pusher("848a626dcb2145f64ca1", {
      cluster: "us2",
      userAuthentication: {
        endpoint: "/api/pusher/user-auth",
        transport: "ajax",
      },
    });

    pusher.signin();

    const channel = pusher.subscribe(channelName);

    channel.bind(eventName, (data: IMessage) => {
      setMessages([...messages, data]);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [messages]);

  const { mutate } = api.development.sendMessage.useMutation();

  const addMessage = (message: string) => {
    // setMessages((messages) => [...messages, message]);
    mutate({ message, channel: channelName, event: eventName });
  };

  if (!isSignedIn) return <SignInModal redirectUrl="/development/activity" />;

  // if (userLoading) return <LoadingPage />;

  return (
    <main className="flex min-h-[100vh] items-center justify-center bg-bhall bg-cover bg-center">
      <div className="flex h-[80vh] w-10/12 flex-col justify-between rounded border border-zinc-600 bg-zinc-700 p-2 shadow-md sm:w-1/3">
        <h1 className="w-full border-b border-zinc-600 text-lg font-semibold">
          Activity
        </h1>
        {isSignedIn && <SignOutButton />}
        {!isSignedIn && <SignInButton />}
        <div>
          {/* <div className="flex h-[50vh] flex-col gap-2 overflow-y-auto truncate bg-red-500"> */}
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              <p className="py-1 text-sm text-zinc-400">{message.message}</p>
            </div>
          ))}
          {/* </div> */}

          <div className="flex gap-1 py-1">
            <input
              type="text"
              className="w-full rounded border border-zinc-500 bg-zinc-600 p-2 outline-none focus:ring-2 focus:ring-amber-600"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addMessage(text);
                }
              }}
            />
            <button
              className="rounded border border-zinc-600 bg-amber-600 p-2 shadow-md"
              onClick={() => addMessage(text)}
            >
              <PaperAirplaneIcon className="h-5 w-5 text-zinc-50" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ActivityPage;
