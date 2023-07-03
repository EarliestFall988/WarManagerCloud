import type { NextPage } from "next";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { DashboardMenu } from "~/components/dashboardMenu";
import { LoadingPage, LoadingPage2 } from "~/components/loading";
import { api } from "~/utils/api";

import { utils, writeFileXLSX, } from "xlsx";
import { useUser } from "@clerk/nextjs";
import SignInModal from "~/components/signInPage";


type DealType = {
    id: number;
    // creator_user_id: {
    //     id: number;
    //     name: string;
    //     email: string;
    //     has_pic: number;
    //     pic_hash: string;
    //     active_flag: boolean;
    //     value: number;
    // };
    // user_id: {
    //     id: number;
    //     name: string;
    //     email: string;
    //     has_pic: number;
    //     pic_hash: string;
    //     active_flag: boolean;
    //     value: number;
    // };
    // person_id: { //customer information ???
    //     active_flag: boolean;
    //     name: string;
    //     email: [
    //         {
    //             label: string;
    //             value: string;
    //             primary: boolean;
    //         }
    //     ];
    //     phone: [
    //         {
    //             label: string;
    //             value: string;
    //             primary: boolean;
    //         }
    //     ];
    //     value: number;
    // };
    // org_id: {
    //     name: string;
    //     people_count: number;
    //     owner_id: number;
    //     address: string;
    //     active_flag: boolean;
    //     cc_email: string;
    //     value: number;
    // };
    // stage_id: number;
    title: string;
    value: number;
    // // currency: string;
    add_time: string;
    update_time: string;
    stage_change_time: string;
    // active: boolean;
    // deleted: boolean;
    status: string; // <---crucial
    probability: number;
    next_activity_date: string;
    next_activity_time: string;
    next_activity_id: number;
    last_activity_id: number;
    last_activity_date: string;
    lost_reason: string;
    visible_to: string;
    close_time: string;
    pipeline_id: number; //pull the stage from here...?
    won_time: string; // need these??
    first_won_time: string; // need these??
    lost_time: string; // need these ??
    products_count: number; // blank column here that pulls the first 10 characters from the left side of the data in the next column
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
    person_name: string; // customer name ?? or owner name?
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

const ReportingPage: NextPage = () => {


    const { isSignedIn, isLoaded } = useUser();

    const { data, isLoading, isError } = api.reporting.getPipedriveDeals.useQuery();

    const handleDownloadPipedriveDeals = useCallback(() => {

        if (!data) {
            toast.error("No data to download");
            return;
        }

        // data?.data.forEach((deal: DealType) => {
        //     console.log(deal);
        // })

        const date = new Date();
        const dateString = `${date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}`;

        // console.log(json);
        // console.log(dateString);

        const ws = utils.json_to_sheet(data?.data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");
        writeFileXLSX(wb, `Deals ${dateString}.xlsx`);

        toast.success("Downloaded data");

    }, [data])


    if (!isLoaded) {
        return <LoadingPage2 />
    }

    if (isLoading) {
        return <LoadingPage />
    }

    if (!isSignedIn && isLoaded) {
        return <SignInModal redirectUrl="/dashboard/reporting" />
    }

    if (isError) {
        return <div>error</div>
    }

    return (
        <>
            <main className="min-h-[100vh] w-full bg-zinc-900 flex items-start justify-start">
                <div>
                    <DashboardMenu />
                </div>
                <div className="p-2 w-full h-full flex flex-col gap-2 justify-start items-start">
                    <div className="flex flex-col items-start justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
                        <h2 className="text-3xl font-semibold">Reporting</h2>
                        <p className="text-md tracking-tight">This is the reporting page</p>
                    </div>
                    <div className="flex flex-col md:items-start gap-2 justify-center w-full h-full bg-zinc-800 p-2 rounded-sm border border-zinc-700">
                        <h2 className="text-xl font-semibold">Pipe Drive</h2>
                        <button onClick={handleDownloadPipedriveDeals} className="p-2 rounded bg-amber-700 hover:bg-amber-600 focus:bg-amber-600 duration-100 transition-all hover:scale-105">{"Download Data (XLSX)"}</button>
                    </div>
                </div>
            </main>
        </>
    )
}

export default ReportingPage;