import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { api } from "~/utils/api";

import { dark } from "@clerk/themes";

import { Toaster, toast } from "react-hot-toast";

import "~/styles/globals.css";
import Head from "next/head";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import WhatsNew from "~/components/whatsnew";

const MyApp: AppType = ({ Component, pageProps }) => {
  const [previousNetworkStatus, setPreviousNetworkStatus] = useState("online"); // ["online", "offline"

  
  const [networkStatus, setNetworkStatus] = useState("online");
  const [showDev, setShowDev] = useState(true);

  const [path, setPath] = useState("");

  const { data } = api.versioning.getVersionType.useQuery();

  const [versionType, setVersionType] = useState("PROD");


  const [showNewFeatures] = useState(false);

  const [seenNewFeatures, setSeenNewFeatures] = useState(false);

  const setSeenFeatures = () => {
    setSeenNewFeatures(true);
  };

  useEffect(() => {
    if (data) {
      setVersionType(data);
    }

    if (data == "PROD") {
      setShowDev(false);
    }
  }, [data]);

  useEffect(() => {
    window.addEventListener("online", () => setNetworkStatus("online"));
    window.addEventListener("offline", () => setNetworkStatus("offline"));
    setPath(window.location.pathname);
  }, []);

  useEffect(() => {
    if (networkStatus === "offline" && previousNetworkStatus === "online") {
      toast.error("You are offline. Some features may not work as expected.", {
        icon: "⚠️",
        // style: {
        //   borderRadius: "10px",
        //   background: "#333",
        //   color: "#fff",
        // },
      });
    }

    if (networkStatus === "online" && previousNetworkStatus === "offline") {
      toast.success("You are back online.", {
        icon: "👍",
        // style: {
        //   borderRadius: "10px",
        //   background: "#333",
        //   color: "#fff",
        // },
      });
    }

    setPreviousNetworkStatus(networkStatus);
  }, [networkStatus, previousNetworkStatus]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />

        <meta
          name="description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        {versionType == "PROD" && (
          <>
            <title>War Manager</title>
            <link
              rel="shortcut icon"
              crossOrigin="use-credentials"
              href="/favicon.ico"
            />
            <link
              rel="mask-icon"
              crossOrigin="use-credentials"
              href="/icon.png"
              color="#27272a"
            />
          </>
        )}
        {versionType == "DEV" && (
          <>
            <title>{"War Manager (Development)"}</title>
            <link
              rel="shortcut icon"
              crossOrigin="use-credentials"
              href="/static/dev_favicon.ico"
            />
            <link
              rel="mask-icon"
              crossOrigin="use-credentials"
              href="/static/WM Web Logo Development v1.png"
              color="#27272a"
            />
          </>
        )}
        <link
          rel="manifest"
          crossOrigin="use-credentials"
          href="/manifest.json"
        />
        <meta name="theme-color" content="#27272a" />
        {/* <link rel="apple-touch-icon" crossOrigin="use-credentials" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="152x152" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="180x180" href="logo.png" />
        <link rel="apple-touch-icon" crossOrigin="use-credentials" sizes="167x167" href="logo.png" /> */}

        <link
          rel="manifest"
          crossOrigin="use-credentials"
          href="/manifest.json"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://warmanager.net" />
        <meta name="twitter:title" content="War Manager" />
        <meta
          name="twitter:description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        <meta
          name="twitter:image"
          content="https://war-manager-website.vercel.app/_nuxt/img/sunset-plane.dc8de7b.jpg"
        />
        {/* <meta name="twitter:creator" content="@TaylorHowell" /> */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="War Manager" />
        <meta
          property="og:description"
          content="War Manager is your digital multi-tool to anticipate challenges in the field."
        />
        <meta property="og:site_name" content="War Manager" />
        <meta property="og:url" content="https://warmanager.net" />
        <meta
          property="og:image"
          content="https://war-manager-website.vercel.app/_nuxt/img/sunset-plane.dc8de7b.jpg"
        />

        {/* <title>War Manager</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <NextNProgress
        color="#da640a"
        height={4}
        showOnShallow={false}
        options={{ easing: "ease", speed: 500, showSpinner: false }}
      />

      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
        {...pageProps}
      >
        <Toaster position="bottom-center" />
        {versionType == "DEV" && showDev && (
          <div className="fixed bottom-0 z-40 flex w-full items-center justify-around font-semibold font-mono text-red-700">
            <div className="flex gap-2 rounded border-2 border-black bg-white/70 px-2">
              <p>Developer version - anything is subject to change.</p>
              <button
                onClick={() => {
                  setShowDev(false);
                }}
              >
                <XMarkIcon className="ml-2 h-5 w-5 cursor-pointer" />
              </button>
            </div>
            <div></div>
          </div>
        )}
        {!seenNewFeatures && showNewFeatures && path !== "/" && <WhatsNew setSeenFeatures={setSeenFeatures} />}
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
};

export { reportWebVitals } from "next-axiom";

export default api.withTRPC(MyApp);
