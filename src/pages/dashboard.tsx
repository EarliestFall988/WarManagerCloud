import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingPage2 } from "~/components/loading";

const OldDashboardPage: NextPage = () => {
  const { push } = useRouter();

  useEffect(() => {
    void push("/dashboard/activity"); //redirect to a valid location...
  }, []);

  return <LoadingPage2 />; // show a loading screen while we redirect...
};

export default OldDashboardPage;
