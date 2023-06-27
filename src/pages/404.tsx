import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import Head from "next/head";
import TooltipComponent from "~/components/Tooltip";
import SignInModal from "~/components/signInPage";

const NotFoundPage: NextPage = () => {
  return (
    <>
      <SignedIn>
        <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>404 Not Found - War Manager</title>
        <meta
          name="description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        <link rel="shortcut icon" crossOrigin="use-credentials" href="/favicon.ico" />
        <link rel="mask-icon" crossOrigin="use-credentials" href="/icon.png" color="#27272a" />
        <meta name="theme-color" content="#27272a" />
        {/* <link rel="apple-touch-icon" crossOrigin="use-credentials" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="152x152" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="180x180" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="167x167" href="logo.png" /> */}
        <link rel="manifest" crossOrigin="use-credentials" href="/manifest.json"/>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://warmanager.net" />
        <meta name="twitter:title" content="War Manager" />
        <meta
          name="twitter:description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        <meta name="twitter:image" content="https://war-manager-website.vercel.app/_nuxt/img/sunset-plane.dc8de7b.jpg" />
        {/* <meta name="twitter:creator" content="@TaylorHowell" /> */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="War Manager" />
        <meta
          property="og:description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        <meta property="og:site_name" content="War Manager" />
        <meta property="og:url" content="https://warmanager.net" />
        <meta property="og:image" content="https://war-manager-website.vercel.app/_nuxt/img/sunset-plane.dc8de7b.jpg" />

        </Head>
        <main className="flex min-h-[100vh] w-full flex-col items-center justify-center bg-zinc-900">
          <div className="p-2">
            <div className="tracking tight text-[3rem] md:text-[4rem]">
              Hmmm...
            </div>
            <div className="border-b border-zinc-800 font-semibold text-amber-700">
              War Manager could not find what you are looking for.
            </div>
            <div className="flex w-full items-center justify-start gap-4 py-2">
              <TooltipComponent content="Back" side="bottom">
                <button className="text-md rounded-sm bg-zinc-700 p-2 transition-all duration-100 hover:bg-zinc-600">
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
              </TooltipComponent>
              <button className="text-md rounded-sm bg-zinc-700 p-2 transition-all duration-100 hover:bg-zinc-600">
                Dashboard
              </button>
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <SignInModal redirectUrl="/dashboard" />
      </SignedOut>
    </>
  );
};

export default NotFoundPage;
