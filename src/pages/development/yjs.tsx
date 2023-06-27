import type { NextPage } from "next";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";
import { useEffect, useState } from "react";

// import dynamic from 'next/dynamic'  //yjs needs to be dynamic...

// const DynamicHeader = dynamic(() => import(''), {
//   ssr: false,
// })

// const websocketConnection =
//   "wss://s9267.nyc1.piesocket.com/v3/1?api_key=j4wp6LYQnmMVL4QYvIWBCQ6q7Bw2qp8q3p56Pfg3";
const websocketConnection1 = "ws://localhost:1234";
const roomName = "my-roomname";

const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";
const localWebRTCConnection = "ws://localhost:4444";

type yjsWsProviderProps = {
  status: string;
};

const YjsPage: NextPage = () => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [text, setText] = useState("");
  const [ws, setws] = useState<WebsocketProvider | null>(null);
  const [wrtc, setwrtc] = useState<WebrtcProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();

    const wsProvider = new WebsocketProvider(
      websocketConnection1,
      roomName,
      ydoc
    );

    const webrtcProvider = new WebrtcProvider(roomName, ydoc, {
      signaling: [localWebRTCConnection ],
      password: "password",
    });

    wsProvider.on("status", (event: yjsWsProviderProps) => {
      console.log(event.status); // logs "connected" or "disconnected"
    });

    setwrtc(webrtcProvider);

    wsProvider.on("sync", (isSynced: yjsWsProviderProps) => {
      console.log(isSynced); // logs "true" or "false"

      if (isSynced) {
        const text = ydoc?.getText("text").toJSON();
        // console.log('text', text)
        setText(text || "");
      }
    });

    webrtcProvider.on("sync", (isSynced: yjsWsProviderProps) => {
      console.log("web rtc synced: ", isSynced); // logs "true" or "false"
    });

    ydoc.on("update", (_update: Uint8Array) => { // update: Uint8Array
      // console.log('update', update)
      const text = ydoc?.getText("text").toJSON();
      // console.log('text', text)
      setText(text || "");
    });

    setYdoc(ydoc);
    setws(wsProvider);

    return () => {
      wsProvider.disconnect();
      ydoc.destroy();
    };
  }, []);

  // ws?.on('sync', isSynced => {
  //     console.log(isSynced) // logs "true" or "false"

  //     if (!isSynced) {
  //         const text = ydoc?.getText('text').toJSON()
  //         console.log('text', text)
  //         setText(text || "")
  //     }
  // })

  const updateText = (text: string) => {
    // console.log('updateText', text)
    if (!ydoc) return;

    Y.transact(ydoc, () => {
      ydoc?.getText("text").delete(0, ydoc?.getText("text").length);
      ydoc?.getText("text").insert(0, text);
    });
    setText(text);
  };

  return (
    <main className="flex min-h-[100vh] flex-col gap-2 bg-zinc-900 p-2">
      <p>yjs {ydoc?.clientID}</p>
      <p>ws connected? {(ws?.wsconnected || wrtc?.connected) ? "true" : "false"}</p>
      <textarea
        value={text}
        placeholder="type here..."
        onChange={(e) => {
          updateText(e.currentTarget.value);
        }}
        className="rounded bg-zinc-800 p-2 text-zinc-200 placeholder:text-zinc-500"
      />
    </main>
  );
};

export default YjsPage;
