import { type NextPage } from "next";
import Head from "next/head";
import { DashboardMenu } from "~/components/dashboardMenu";

const HelpPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Help | War Manager</title>
      </Head>
      <main className="flex min-h-[100vh] w-full bg-zinc-900">
        <DashboardMenu />
        <div className="w-full">
          <div className="w-full bg-zinc-800 p-2">
            <h1 className="border-b border-zinc-700 text-4xl font-semibold">
              Videos
            </h1>
            <div className="p-5">
              <div className="m-auto flex flex-wrap items-center gap-2 p-2 md:justify-center">
                <div className="md:w-72">
                  <div className="mb-2 border-b border-zinc-600">
                    <h3 className="text-2xl">
                      Installing War Manager On Your Desktop
                    </h3>
                    <p className="italic text-zinc-100">2 Min</p>
                  </div>
                  <p className="text-zinc-300">
                    Install War Manager an an app on your desktop.
                  </p>
                </div>
                <iframe
                  className="rounded-xl border border-zinc-600"
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/QQGqUBcPkI0"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen={true}
                ></iframe>
              </div>
              <div className="h-24"></div>
              <div className="m-auto flex flex-wrap items-center gap-2 p-2 md:justify-center">
                <div className="md:w-72">
                  <div className="mb-2 border-b border-zinc-600">
                    <h3 className="text-2xl">How To Create A Schedule</h3>
                    <p className="italic text-zinc-100">7 Min</p>
                  </div>
                  <p className="text-zinc-300">
                    This video shows how to create a schedule using the
                    blueprints features from start to finish.
                  </p>
                </div>
                <iframe
                  className="rounded-xl border border-zinc-600"
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/yAaZb0a1wsk"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen={true}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HelpPage;
