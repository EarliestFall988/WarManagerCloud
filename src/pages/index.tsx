import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors.content;

      // console.log(e.shape?.data?.zodError?.fieldErrors.content)

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong! Please try again later");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full gap-3 ">
      <Image
        src={user.profileImageUrl}
        alt={`my profile picture`}
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
      />
      <input
        placeholder="Type some emojis!"
        className="w-full bg-transparent p-2 outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            mutate({ content: input });
          }
        }}
      />
      {input != "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching early to cache data
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Main Menu</title>
        <meta name="description" content="All data lives here." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!!isSignedIn && (
        <div className="absolute p-2">
          <SignOutButton />
        </div>
      )}
      <PageLayout>
        <div className="flex border-b border-slate-300  p-4">
          {!isSignedIn && (
            <div className="flex justify-center font-bold">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
