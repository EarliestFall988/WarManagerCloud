import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import React from "react";
import Pusher from "pusher-js";

interface IMessage {
  message: string;
}

const ActivityPage: NextPage = () => {
  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const channelName = "channel";
  const eventName = "event";

  useEffect(() => {
    const pusher = new Pusher("848a626dcb2145f64ca1", {
      cluster: "us2",
    });

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

  return (
    <main className="flex min-h-[100vh] items-center justify-center bg-zinc-800">
      <div className="w-1/3 rounded border border-zinc-600 bg-zinc-700 p-2 shadow-md">
        <h1 className="text-lg font-semibold">Activity</h1>
        <div className="border-t border-zinc-600 py-2" />
        {messages.map((message, index) => (
          <div key={index} className="flex flex-col">
            <p className="py-1 text-sm text-zinc-400">{message.message}</p>
          </div>
        ))}
        <div className="border-t border-zinc-600 py-2" />
        <input
          type="text"
          className="w-full rounded border border-zinc-600 bg-zinc-600 p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addMessage(text);
            }
          }}
        />
        <div className="py-2" />
        <button
          className="w-full rounded border border-zinc-600 bg-amber-600 p-2 shadow-md"
          onClick={() => addMessage(text)}
        >
          Send
        </button>
      </div>
    </main>
  );
};

export default ActivityPage;
