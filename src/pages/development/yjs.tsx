import type { NextPage } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";


import * as Y from "yjs";
import { IndexeddbPersistence } from 'y-indexeddb'
import { toast } from "react-hot-toast";
import { LoadingPage, LoadingPageWithHeader } from "~/components/loading";
import { GetPusherClient, MemberMe, memberDetails, memberWrapper, membersObject } from "~/utils/pusherClientUtil";
import type { Channel, Members } from "pusher-js";
import Pusher from "pusher-js"
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import TooltipComponent from "~/components/Tooltip";
import Image from "next/image";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";


const YJSPage: NextPage = () => {


    const { isSignedIn } = useUser();

    const id = "clic46tem0004lngsgwtz6upl"

    const [text, setText] = useState("")
    const [text2, setText2] = useState("")

    //yjs
    const [doc1, setDoc1] = useState<Y.Doc | null>(null)
    const [doc2, setDoc2] = useState<Y.Doc | null>(null)
    const [synced, setSynced] = useState(false)

    //pusher
    const [channelName, setChannelName] = useState<string>(`presence-${id}`);
    const [eventName, setEventName] = useState<string>("client-event");
    const [members, setMembers] = useState<Members | undefined>(undefined);
    const [message, setMessage] = useState<string>("test message");
    const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);
    const [pusher, setPusher] = useState<Pusher | null>(null);
    const [error, setIsError] = useState<string | null>(null);

    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

    const { data: blueprint } = api.blueprints.getOneById.useQuery(
        {
            blueprintId: id
        }
    )

    useEffect(() => {

        const d1 = new Y.Doc();
        const d2 = new Y.Doc();

        const p = GetPusherClient();
        setPusher(p);
        p.signin();
        p.connection.bind('connected', () => {
            console.log("connected");
            handleSubscribe(p);
        });

        setDoc1(d1);
        setDoc2(d2);

        const browserDB = new IndexeddbPersistence(id, d1)

        browserDB.on('synced', () => {
            setSynced(true);
            setText(d1.getArray('array').toArray()[0] as string)
        })

        // setProvider(p);

        return () => {
            doc1?.destroy();
            doc2?.destroy();

            handleUnsubscribe(p);
            p.disconnect();
        }
    }, [])


    const updateText = useCallback((data: string) => {
        setReceivedMessages([...receivedMessages, data]); // yjs goes here
    }, [receivedMessages]);

    useEffect(() => {

        if (pusherChannel && pusherChannel.bind) {


            pusherChannel.unbind(eventName);

            pusherChannel.bind(eventName, (data: string) => {
                // console.log("data", data);
                updateText(data)
            })
        }

        return () => {
            if (pusherChannel)
                pusherChannel.unbind(eventName);
        }
    }, [pusherChannel, receivedMessages, eventName, updateText])


    const handleSubscribe = (p: Pusher) => {

        // console.log("handleSubscribe")

        if (!channelName || !p) {
            return;
        }

        const channel = p.subscribe(channelName);

        channel.bind("pusher:subscription_succeeded", function (members: Members) {
            setMembers(members);
            // console.log(`success! ${channelName} connection - members`, members);
            setPusherChannel(channel);
            toast.success("Connected! You can now see live changes.")
        });

        channel.bind("pusher:subscription_error", function (status: number) {
            console.log(`error! ${channelName} connection - status`, status);
            setIsError(`Not authorized to view resource. Try signing in.`);
            // toast.error("Not authorized to view resource. Try signing in.");
        });
    }


    const updateMembers = useCallback(() => {
        setMembers(members);
    }, [members])

    useEffect(() => {

        if (pusherChannel && pusherChannel.bind) {

            pusherChannel.unbind("pusher:member_added");

            pusherChannel.bind("pusher:member_added", (data: MemberMe) => {
                // console.log("data", data);
                members?.addMember(data)
                setMembers(members);
                updateMembers();
                // console.log(data);
                toast.loading(`${data.info.name} joining...`,
                    {
                        duration: 5000,
                    }
                )
                // console.log("added member", members);
            })
        }

        return () => {
            if (pusherChannel)
                pusherChannel.unbind("pusher:member_added");
        }
    }, [pusherChannel, members, updateMembers])


    useEffect(() => {

        if (pusherChannel && pusherChannel.bind) {


            pusherChannel.unbind("pusher:member_removed");

            pusherChannel.bind("pusher:member_removed", (data: MemberMe) => {
                // console.log("data", data);
                members?.removeMember(data);
                setMembers(members);
                updateMembers();

                toast.loading(`${data.info.name} leaving... `,
                    {
                        duration: 3000,
                    }
                )
                // console.log("removed member", members);
            })
        }

        return () => {
            if (pusherChannel)
                pusherChannel.unbind("pusher:member_removed");
        }
    }, [pusherChannel, members, updateMembers])


    const handleUnsubscribe = (p: Pusher) => {
        if (!channelName || !p) {
            return;
        }

        p.unsubscribe(channelName);
        setPusherChannel(null);
    }

    const handleSendMessage = useCallback(() => {
        if (!pusherChannel) {
            return;
        }

        // console.log("sending message", message)

        pusherChannel.trigger(eventName, message);
        updateText(message); // yjs trigger here!!
    }, [pusherChannel, eventName, message, updateText])


    // if (true) {
    //     return <LoadingPageWithHeader title="syncing" />
    // }

    if ((!pusherChannel || !pusher || !members || !blueprint || !synced) && !error) {

        if (!synced) {
            return <LoadingPageWithHeader title={""} />
        }

        if (!blueprint) {
            return <LoadingPageWithHeader title={""} />
        }

        if (!pusher) {
            return <LoadingPageWithHeader title={""} />
        }

        if (!pusherChannel) {
            return <LoadingPageWithHeader title={""} />
        }

        if (!members) {
            return <LoadingPageWithHeader title={""} />
        }
    }

    if (error && isSignedIn) {

        return (
            <main className="bg-zinc-900 min-h-[100vh] p-2 flex ">
                <div className="bg-zinc-800 flex flex-col items-center justify-center p-2 rounded gap-2 w-full">
                    <h1 className="text-zinc-200 text-lg font-semibold">Error</h1>
                    <p className="text-zinc-200">{error}</p>
                </div>
            </main >
        )
    }

    if (error && !isSignedIn) {

        return (
            <SignInModal redirectUrl="/development/channels" />
        )
    }



    const getListOfMembers = () => {
        if (!members) return [] as memberWrapper[];

        // console.log(members);

        const m = members.members as membersObject;

        const values = Object.keys(m).map((value) => {
            // console.log("value", value)
            const obj = m[value] as memberDetails;
            if (value !== undefined && obj !== undefined)
                return { id: value, member: obj } as memberWrapper | null; // <- leave this null alone. JS/TS doesn't remove the null/undefined in a filter

            return null;
        })


        values.flatMap((value) => {
            // console.log("flatmapping", value)
            if (value !== null)
                return [value];
            else return [];
        })

        // console.log("returning member values", values)

        return values;
    }

    const getMyData = () => {
        if (!members) return null;

        const m = members.me as MemberMe;

        return m;
    }


    if (doc1 && doc2) {

        doc1.on('update', update => {
            Y.applyUpdate(doc2, update)
            // console.log("doc1", doc1.getArray('array').toArray())
            setText(doc1.getArray('array').toArray()[0] as string)
        })

        doc2.on('update', update => {
            Y.applyUpdate(doc1, update)
            // console.log("doc2", doc2.getArray('array').toArray())
            setText2(doc2.getArray('array').toArray()[0] as string)
        })
    }

    const callUpdate = (value: string) => {
        // console.log("before", value);
        doc1?.getArray('array').insert(0, [value])
        setText(value);
    }


    return (
        <main className="min-h-[100vh] bg-zinc-900 justify-start items-start flex flex-col gap-2">
            <NewItemPageHeader title="YJS Test" />
            <div className="flex flex-col gap-4 w-full md:w-1/2 mx-auto bg-zinc-800 p-2 rounded" >
                <div className="flex justify-center w-1/2" >
                    <div className="overflow-hidden w-full bg-zinc-800 border-b border-zinc-700 p-1">
                        {
                            getListOfMembers().length > 0 && (
                                <div className="flex gap-2 justify-start items-center">
                                    {
                                        getListOfMembers().map((m, index) => (
                                            <div key={index} className={`text-zinc-200 ${getMyData()?.id == m?.id ? "" : (m != null ? "" : "")} `}>
                                                <TooltipComponent side="bottom" content={`${getMyData()?.id == m?.id ? `${m != null ? m.member.email : ""} (Me)` : (m != null ? m.member.email : "")}`}>
                                                    <Image src={m?.member.avatar || ""} width={32} height={32} alt={`${m != null ? m.member.email : ""}'s avatar`} className="rounded-md" />
                                                </TooltipComponent>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
                <div>
                    <h3 >Edit Document</h3>
                    <textarea value={text} onChange={(e) => { callUpdate(e.currentTarget.value) }} className="rounded p-2 bg-zinc-700 border-zinc-600 border w-1/2">
                    </textarea>
                </div>

                {/* <textarea value={text2} onChange={(e) => { callUpdate2(e.currentTarget.value) }} className="rounded p-2 bg-zinc-700 border-zinc-600 border w-1/2">
                </textarea> */}
            </div>
        </main>
    )
}

export default YJSPage;