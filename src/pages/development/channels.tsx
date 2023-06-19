import { RocketLaunchIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import Pusher, { type Members, type Channel } from "pusher-js";
import { LoadingPage } from "~/components/loading";
import { useUser } from "@clerk/nextjs";
import { type memberInstance } from "~/server/helpers/pusherInstance";
import Image from "next/image";
import TooltipComponent from "~/components/Tooltip";
import SignInModal from "~/components/signInPage";
import { type Blueprint } from "@prisma/client";
import { api } from "~/utils/api";
import { useRouter } from "next/router";


const ChannelsTestPage: NextPage = () => {


    const { isSignedIn } = useUser();
    const id = "clic46tem0004lngsgwtz6upl"


    // console.log("id", id)

    const [channelName, setChannelName] = useState<string>(`presence-${id}`);
    const [eventName, setEventName] = useState<string>("client-event");
    const [members, setMembers] = useState<Members | undefined>(undefined);
    const [message, setMessage] = useState<string>("test message");
    const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);
    const [pusher, setPusher] = useState<Pusher | null>(null);
    const [error, setIsError] = useState<string | null>(null);

    const [receivedMessages, setReceivedMessages] = useState<string[]>([]);



    useEffect(() => {

        // if (!SignedIn) return;


        // console.log("signed in")

        const p = new Pusher("848a626dcb2145f64ca1", {
            cluster: "us2",
            forceTLS: true,
            userAuthentication: {
                endpoint: "/api/pusher/user-auth", // contact the correct endpoints
                transport: "ajax",
            },
            channelAuthorization: {
                endpoint: "/api/pusher/channel-auth", //contact the correct endpoints
                transport: "ajax",
            }
        });

        setPusher(p);


        p.signin(); // sign in the user

        p.connection.bind("connected", () => {
            // console.log("connected");
            handleSubscribe(p);
        });


        return () => {
            // console.log("unsubscribing");
            handleUnsubscribe(p);
            p.disconnect();
        }
    }, [])

    const updateText = useCallback((data: string) => {
        setReceivedMessages([...receivedMessages, data]);
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

    const { data: blueprint } = api.blueprints.getOneById.useQuery(
        {
            blueprintId: id
        }
    )


    const handleSubscribe = (p: Pusher) => {

        // console.log("handleSubscribe")

        if (!channelName || !p) {
            return;
        }

        const channel = p.subscribe(channelName);

        channel.bind("pusher:subscription_succeeded", function (members: Members) {
            setMembers(members);
            console.log(`success! ${channelName} connection - members`, members);
            setPusherChannel(channel);
        });

        channel.bind("pusher:subscription_error", function (status: number) {
            console.log(`error! ${channelName} connection - status`, status);
            setIsError(`Not authorized to view resource. Try signing in.`);
        });

        channel.bind("pusher:member_added", (member: Members) => {
            setMembers(member);
        });

        channel.bind("pusher:member_removed", (member: Members) => {
            setMembers(member);
        });
    }

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
        updateText(message);
    }, [pusherChannel, eventName, message, updateText])


    if (!pusherChannel && !error && !blueprint) {
        return <LoadingPage />
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
        if (!members) return [] as memberInstance[];

        const membersArray = [] as memberInstance[];

        members.each((member: memberInstance) => {
            // console.log(member);
            membersArray.push(member);
        });

        return membersArray;
    }

    return (
        <main className="bg-zinc-900 min-h-[100vh] p-2 flex ">
            <div className="bg-zinc-800 flex flex-col justify-between p-2 rounded gap-2 w-full">

                <div className="flex flex-col justify-between items-start gap-1">
                    <div className="flex gap-2 whitespace-nowrap border-b border-zinc-700 w-full justify-between" >
                        <h1 className="text-zinc-200 text-lg font-semibold">Messages</h1>
                        <p className="text-zinc-200">{blueprint?.name}</p>
                        {
                            getListOfMembers().length > 0 && (
                                <div className="flex gap-2 justify-center items-center p-2">
                                    <p className="text-zinc-200">Members:</p>
                                    {
                                        getListOfMembers().map((m, index) => (
                                            <div key={index} className="text-zinc-200">
                                                <TooltipComponent side="bottom" content={m.info.email}>
                                                    <Image src={m.info.avatar} width={32} height={32} alt={`${m.info.email}'s avatar`} className="rounded-full" />
                                                </TooltipComponent>
                                            </div>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div>
                        {
                            receivedMessages.length > 0 && (
                                receivedMessages.map((message, index) => (
                                    <p key={index} className="text-zinc-200">{message}</p>
                                ))
                            )
                        }
                        {
                            receivedMessages.length === 0 && (
                                <p className="text-zinc-200">No messages received</p>
                            )
                        }
                    </div>
                </div>
                <div className="flex justify-start gap-2 w-full">
                    <div className="flex flex-col gap-2 w-1/2" >
                        <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="channel name" className="rounded px-1 bg-zinc-700 border border-zinc-600 w-full hover:border-zinc-500 focus:ring-1 focus:ring-amber-700 outline-none text-zinc-200" />
                        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="event name" className="rounded px-1 bg-zinc-700 border border-zinc-600 w-full hover:border-zinc-500 focus:ring-1 focus:ring-amber-700 outline-none text-zinc-200" />
                        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="message" className="rounded px-1 bg-zinc-700 border border-zinc-600 w-full hover:border-zinc-500 focus:ring-1 focus:ring-amber-700 outline-none text-zinc-200" />
                        <button className="rounded px-1 bg-amber-700 w-full flex items-center justify-center p-1 outline-none text-zinc-200" onClick={() => { handleSendMessage() }}>
                            <RocketLaunchIcon className="h-5 w-5 text-zinc-50" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 rounded w-1/3" >
                        <p className="text-zinc-200">Channel: {channelName}</p>
                        <p className="text-zinc-200">Event: {eventName}</p>
                        <p>Pusher: {pusher ? "connected" : "disconnected"}</p>
                        <p>Socket Connection: {pusherChannel ? "connected" : "disconnected"}</p>
                    </div>
                </div>
            </div>
        </main>
    )

}

export default ChannelsTestPage;