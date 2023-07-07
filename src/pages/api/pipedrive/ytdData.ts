
import type { NextApiRequest } from "next";
import { NextResponse } from "next/server";

const api_key = process.env.PIPE_DRIVE_API_KEY;
const api_token = process.env.PIPE_DRIVE_API_TOKEN;
const company_domain = process.env.PIPE_DRIVE_COMPANY_DOMAIN;
const azure_function_url = process.env.PIPE_DRIVE_AZURE_FUNCTION_URL;

export const config = {
    runtime: 'edge',
}

type DownloadPipeDriveDetails =
    {
        id: number;
        owner: string;
        PrimaryEstimator: string;
        SecondaryEstimator: string;
        value: string; //format correctly
        stage: string;
        status: string;
        UpdateTime: string;
        StatusUpdateTime: string; //merge won and lost into status time
        StageUpdateTime: string;
        ActivitiesCompletedLastWeek: number; //probably not accurate, will need to check last changed date???
    }


const PipeDriveYTDDealsEdgeFunction = async (req: NextApiRequest) => {

    if (azure_function_url === undefined || azure_function_url === "") {
        return NextResponse.json({ error: "azure_function_url is undefined" })
    }

    if (req.method != "GET") {
        return NextResponse.json({ error: "method is not a GET" })
    }

    const data = await fetch(azure_function_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            api_key: api_key,
            company_domain: company_domain,
            token: api_token,
            purpose: "ytd_deals"
        })
    }).then((res) => res.json()).catch(e => console.log(e)) as DownloadPipeDriveDetails[];

    console.log(data);

    return NextResponse.json(data || []);
}


export default PipeDriveYTDDealsEdgeFunction;
