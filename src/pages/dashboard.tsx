
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingPage2 } from "~/components/loading";



const OldDashboardPage: NextPage = () => {

    const { push } = useRouter();

    useEffect(() => {
        void push("/dashboard/activity")
    }, []);

    return (
        <LoadingPage2 />
    )
}

export default OldDashboardPage;