import Pusher from "pusher-js"



export type memberWrapper = {
    id: string,
    member: memberDetails
}

export type membersObject = {
    [key: string]: memberDetails
}

export type memberDetails = {
    name: string,
    email: string,
    avatar: string
}

export type MemberMe = {
    id: string,
    info: memberDetails
}


export const GetPusherClient = () => {
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

    return p;
}


