import {
  AtSymbolIcon,
  ChevronDoubleDownIcon,
  FaceFrownIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { type NextPage } from "next";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { DashboardMenu } from "~/components/dashboardMenu";
import { InputComponent, TextareaComponent } from "~/components/input";
import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";

const HelpPage: NextPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { mutate: sendEmail, isLoading: sendingMessage } =
    api.messageHandling.sendMessage.useMutation({
      onSuccess: () => {
        toast.success("Message sent!");
        setTitle("");
        setMessage("");
      },

      onError: (error) => {
        console.log(error);
        toast.error("something went wrong");
      },
    });

  const copyToClipboard = (text: string, context: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(
      `${context} to clipboard! You can now paste it somewhere else.`,
      {
        duration: 5000,
      }
    );
  };

  const sendMessage = () => {
    if (title.length < 1) {
      toast.error("Please enter a title");
      return;
    }

    if (message.length < 1) {
      toast.error("Please enter a message");
      return;
    }

    sendEmail({
      title,
      message,
    });
  };

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
          <div>
            <div className="flex min-h-[50vh] w-full items-center justify-center bg-amber-700 p-2">
              <div className="w-full md:w-1/2">
                <div className="flex flex-wrap gap-4">
                  <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-4xl ">
                    <QuestionMarkCircleIcon className="h-8 w-8 text-zinc-100" />
                    Have a question?
                  </h1>
                  <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-4xl">
                    <XMarkIcon className="h-8 w-8 text-zinc-100" />
                    Found an issue?
                  </h1>
                  <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight md:text-4xl">
                    <div className="h-8 w-8">
                      <FaceFrownIcon className="h-8 w-8 text-zinc-100" />
                    </div>
                    Is there something frustrating?
                  </h1>
                </div>
                <p className="py-8 italic">
                  We get it - War Manager is a new app and there are bound to be
                  some issues. We are working hard to make War Manager the best
                  it can be. If you have a question or found an issue, please
                  let us know.
                </p>
                <h3 className="w-full pb-2 text-center text-lg">
                  Click or tap to copy <br />
                  <ChevronDoubleDownIcon className="inline-block h-6 w-6 animate-bounce" />
                </h3>
                <div className="m-auto flex w-full flex-wrap items-center justify-start gap-2  md:justify-around lg:flex-nowrap">
                  <button
                    onClick={() => {
                      copyToClipboard("taylor.howell@jrcousa.com", "Email");
                    }}
                    className="flex items-center gap-2 rounded-md border border-zinc-100 md:justify-center"
                  >
                    <div className="flex items-center justify-center gap-2 p-2">
                      <AtSymbolIcon className="h-6 w-6" />
                      <p className=" text-lg font-semibold">
                        taylor.howell@jrcousa.com
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      copyToClipboard("(913) 749-7477", "Phone");
                    }}
                    className="flex items-center gap-2 rounded-md border border-zinc-100 md:justify-center"
                  >
                    <div className="flex items-center justify-center gap-2 p-2">
                      <PhoneIcon className="h-6 w-6" />
                      <p className="text-lg font-semibold">(913) 749-7477</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-zinc-700 px-2">
              <div className="lg:w-1/2">
                <h2 className="pb-8  text-2xl font-semibold md:text-4xl">
                  Send us a quick message here
                </h2>
                <h3 className="flex text-lg">Title</h3>
                <InputComponent
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  disabled={false}
                  placeholder="Title"
                />
                <h3 className="flex text-lg">Your message</h3>
                <TextareaComponent
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                  disabled={false}
                  placeholder="What's on your mind?"
                />
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      sendMessage();
                    }}
                    className="flex items-center justify-center gap-2 rounded-md bg-amber-700 p-2 text-zinc-100 outline-none transition duration-100 hover:scale-105 hover:bg-amber-600 focus:bg-amber-600"
                  >
                    {!sendingMessage && (
                      <>
                        <p>Send</p>
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </>
                    )}
                    {sendingMessage && <LoadingSpinner />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-zinc-900 text-center lg:text-left">
        <div className="p-4 text-center text-zinc-700 dark:text-zinc-200">
          © {new Date(Date.now()).getFullYear()} Copyright:{" "}
          <a
            className="text-zinc-800 dark:text-zinc-400"
            href="https://jrcousa.com/"
          >
            {" "}
            JR&Co Roofing Contractors LLC.
          </a>
        </div>
      </footer>
    </>
  );
};

export default HelpPage;
