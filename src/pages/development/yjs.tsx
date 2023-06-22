import type { NextPage } from "next";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useState } from "react";
import { set } from "zod";

const websocketConnection = "wss://s9267.nyc1.piesocket.com/v3/1?api_key=j4wp6LYQnmMVL4QYvIWBCQ6q7Bw2qp8q3p56Pfg3"
const websocketConnection1 = "ws://localhost:1234"
const roomName = "my-roomname"



const YjsPage: NextPage = () => {

    const [ydoc, setYdoc] = useState<Y.Doc | null>(null)
    const [text, setText] = useState('')
    const [ws, setws] = useState<WebsocketProvider | null>(null)

    useEffect(() => {

        const ydoc = new Y.Doc()

        const wsProvider = new WebsocketProvider(websocketConnection1, roomName, ydoc)

        wsProvider.on('status', event => {
            console.log(event.status) // logs "connected" or "disconnected"
        })

        wsProvider.on('sync', isSynced => {
            console.log(isSynced) // logs "true" or "false"

            if (isSynced) {
                const text = ydoc?.getText('text').toJSON()
                // console.log('text', text)
                setText(text || "")
            }
        });

        ydoc.on('update', update => {
            // console.log('update', update)
            const text = ydoc?.getText('text').toJSON()
            // console.log('text', text)
            setText(text || "")
        })

        setYdoc(ydoc);
        setws(wsProvider)

        return () => {
            wsProvider.disconnect()
            ydoc.destroy()
        }

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
        if (!ydoc) return

        Y.transact(ydoc, () => {
            ydoc?.getText('text').delete(0, ydoc?.getText('text').length)
            ydoc?.getText('text').insert(0, text)
        })
        setText(text)
    }

    return (
        <main className="p-2 min-h-[100vh] bg-zinc-900 flex flex-col gap-2">
            <p>yjs {ydoc?.clientID}</p>
            <p>ws connected? {ws?.wsconnected ? "true" : "false"}</p>
            <textarea value={text} placeholder="type here..." onChange={(e) => { updateText(e.currentTarget.value) }} className="p-2 rounded bg-zinc-800 text-zinc-200 placeholder:text-zinc-500" />
        </main>
    );
}

export default YjsPage;