import { env } from "process";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { api } from "~/utils/api";
import { url } from "inspector";


const api_key = env.PIPE_DRIVE_API_KEY;

type dealResponse = {
    success: boolean;
    data: [
        {
            id: number;
            creator_user_id: {
                id: number;
                name: string;
                email: string;
                has_pic: number;
                pic_hash: string;
                active_flag: boolean;
                value: number;
            };
            user_id: {
                id: number;
                name: string;
                email: string;
                has_pic: number;
                pic_hash: string;
                active_flag: boolean;
                value: number;
            };
            person_id: {
                active_flag: boolean;
                name: string;
                email: [
                    {
                        label: string;
                        value: string;
                        primary: boolean;
                    }
                ];
                phone: [
                    {
                        label: string;
                        value: string;
                        primary: boolean;
                    }
                ];
                value: number;
            };
            org_id: {
                name: string;
                people_count: number;
                owner_id: number;
                address: string;
                active_flag: boolean;
                cc_email: string;
                value: number;
            };
            stage_id: number;
            stageName: string;
            stage_pipelineName: string;
            stage_dealProbability: number;
            title: string;
            value: number;
            currency: string;
            add_time: string;
            update_time: string;
            stage_change_time: string;
            active: boolean;
            deleted: boolean;
            status: string;
            probability: number;
            next_activity_date: string;
            next_activity_time: string;
            next_activity_id: number;
            last_activity_id: number;
            last_activity_date: string;
            lost_reason: string;
            visible_to: string;
            close_time: string;
            pipeline_id: number;
            won_time: string;
            first_won_time: string;
            lost_time: string;
            products_count: number;
            files_count: number;
            notes_count: number;
            followers_count: number;
            email_messages_count: number;
            activities_count: number;
            done_activities_count: number;
            undone_activities_count: number;
            reference_activities_count: number;
            participants_count: number;
            expected_close_date: string;
            last_incoming_mail_time: string;
            last_outgoing_mail_time: string;
            label: number;
            stage_order_nr: number;
            person_name: string;
            org_name: string;
            next_activity_subject: string;
            next_activity_type: string;
            next_activity_duration: string;
            next_activity_note: string;
            formatted_value: string;
            weighted_value: number;
            formatted_weighted_value: string;
            weighted_value_currency: string;
            rotten_time: string;
            owner_name: string;
            cc_email: string;
            org_hidden: boolean;
            person_hidden: boolean;
        }
    ];
    additional_data: {
        pagination: {
            start: number;
            limit: number;
            more_items_in_collection: boolean;
        };
    };
    related_objects: {
        user: {
            [key: string]: {
                id: number;
                name: string;
                email: string;
                has_pic: number;
                pic_hash: string;
                active_flag: boolean;
                value: number;
            };
        };
        person: {
            [key: string]: {
                active_flag: boolean;
                name: string;
                email: [
                    {
                        label: string;
                        value: string;
                        primary: boolean;
                    }
                ];
                phone: [
                    {
                        label: string;
                        value: string;
                        primary: boolean;
                    }
                ];
                value: number;
            };
        };
        organization: {
            [key: string]: {
                name: string;
                people_count: number;
                owner_id: number;
                address: string;
                active_flag: boolean;
                cc_email: string;
                value: number;
            };
        };
        stage: {
            [key: string]: {
                id: number;
                name: string; //pull the pipeline name
                active_flag: boolean;
                deal_probability: number;
                pipeline_id: number;
                rotten_flag: boolean;
                rotten_days: number;
                add_time: string;
                update_time: string;
                pipeline_name: string;
                pipeline_deal_probability: number;
                pipeline_order_nr: number;
                pipeline_active: boolean;
            };
        };
        pipeline: {

            [key: string]: {
                id: number;
                name: string;
                url_title: string;
                active: boolean;
                add_time: string;
                update_time: string;
                selected: boolean;
                creator_user_id: number;
                order_nr: number;
                deal_probability: number;
                rotten_flag: boolean;
                rotten_days: number;
                weighted_value: number;
                owner_name: string;
                owner_id: number;
            };
        };
    };
}


export const reportingRouter = createTRPCRouter({

    getPipedriveDeals: privateProcedure.query(async ({ ctx }) => {


        const allDeals = [];
        let cursor = 0;


        let deals = await getDeals(cursor);

        while (deals && deals.data && deals.data.length > 0 && cursor < 50) {
            // console.log(deals.data);
            console.log(deals.related_objects);

            deals.data.map((deal) => {
                const stageId = deal.stage_id
                const stage = deals.related_objects.stage[stageId]

                if (stage) {
                    deal.stageName = stage.name;
                    deal.stage_pipelineName = stage.pipeline_name;
                    // deal.stage_dealProbability = stage.deal_probability;
                }

            })

            // console.log(deals.additional_data.pagination.start)

            allDeals.push(...deals.data);
            cursor += 50;
            deals = await getDeals(cursor);
        }

        return allDeals;

    }),
})



// const getDealDetails = async (dealId: number) => {

//     if (api_key === undefined) {
//         throw new Error("Pipedrive API key not found");
//     }

//     // const dateTime = new Date().setUTCMonth(new Date().getUTCMonth() - 1);
//     // const iso = new Date(dateTime).toISOString();

//     const urlString = `https://jrcoinc.pipedrive.com/api/v1/deals/${dealId}?api_token=${api_key}`

//     const deals = await fetch(urlString, {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json",
//         },
//     }).then((res) => res.json()) as dealResponse;

//     // console.log(deals)

//     return deals;
// }


const getDeals = async (cursor: number) => {

    if (api_key === undefined) {
        throw new Error("Pipedrive API key not found");
    }

    const dateTime = new Date().setUTCMonth(new Date().getUTCMonth() - 1);
    const iso = new Date(dateTime).toISOString();

    const urlString = `https://jrcoinc.pipedrive.com/api/v1/deals?limit=50&api_token=${api_key}&start=${cursor}&sort=update_time DESC,add_time DESC,title ASC`

    const deals = await fetch(urlString, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json()) as dealResponse;

    // console.log(deals)

    return deals;

}
