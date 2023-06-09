// import { type NextPage } from "next";
// import Head from "next/head";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { LogoComponentLarge } from "~/components/RibbonLogo";

// import { api } from "~/utils/api";
// import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
// import { useState } from "react";

// import Image from "next/image";
// import { LoadingPage, LoadingSpinner } from "~/components/loading";
// import { toast } from "react-hot-toast";
// import { PageLayout } from "~/components/layout";
// import { PostView } from "~/components/postview";

// const CreatePostWizard = () => {
//   const { user } = useUser();

//   const [input, setInput] = useState("");

//   const ctx = api.useContext();

//   const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
//     onSuccess: () => {
//       setInput("");
//       void ctx.posts.getAll.invalidate();
//     },
//     onError: (e) => {
//       const errorMessage = e.shape?.data?.zodError?.fieldErrors.content;

//       // console.log(e.shape?.data?.zodError?.fieldErrors.content)

//       if (errorMessage && errorMessage[0]) {
//         toast.error(errorMessage[0]);
//       } else {
//         toast.error("Something went wrong! Please try again later");
//       }
//     },
//   });

//   if (!user) {
//     return null;
//   }

//   return (
//     <div className="flex w-full gap-3 ">
//       <Image
//         src={user.profileImageUrl}
//         alt={`my profile picture`}
//         className="h-12 w-12 rounded-full"
//         width={48}
//         height={48}
//       />
//       <input
//         placeholder="Type some emojis!"
//         className="w-full bg-transparent p-2 outline-none"
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         disabled={isPosting}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             mutate({ content: input });
//           }
//         }}
//       />
//       {input != "" && !isPosting && (
//         <button onClick={() => mutate({ content: input })}>Post</button>
//       )}

//       {isPosting && (
//         <div className="flex items-center justify-center">
//           <LoadingSpinner />
//         </div>
//       )}
//     </div>
//   );
// };

// const Feed = () => {
//   const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

//   if (postsLoading) return <LoadingPage />;

//   if (!data) return <div>Something went wrong</div>;

//   return (
//     <div className="flex flex-col">
//       {data?.map((fullPost) => (
//         <PostView {...fullPost} key={fullPost.post.id} />
//       ))}
//     </div>
//   );
// };

// const Home: NextPage = () => {
//   const { isLoaded: userLoaded, isSignedIn } = useUser();

//   //start fetching early to cache data
//   api.posts.getAll.useQuery();

//   if (!userLoaded) return <div />;

//   return (
//     <>
//       <Head>
//         <title>War Manager</title>
//         <meta
//           property="og:title"
//           content="Where you can manage anything."
//         />
//         <meta
//           property="og:description"
//           content="Start managing your projects, crew members, projects and more from the dashboard"
//         />
//         <meta
//           property="og:image"
//           content="/bhall_logo.png"
//         />
//         <meta name="description" content="Where you can manage anything." />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       {!!isSignedIn && (
//         <div className="absolute p-2">
//           <SignOutButton />
//         </div>
//       )}
//       <PageLayout>
//         <div className="flex border-b border-slate-300  p-4">
//           {!isSignedIn && (
//             <div className="flex justify-center font-bold">
//               <SignInButton />
//             </div>
//           )}
//           {isSignedIn && <CreatePostWizard />}
//         </div>
//         <Feed />
//       </PageLayout>
//     </>
//   );
// };

// export default Home;

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>War Manager Landing Page</title>
      </Head>
      <div className="fixed left-0 top-0 -z-20 h-full w-full bg-bhall bg-cover bg-top" />
      <main className="min-h-[100vh] overflow-x-hidden bg-zinc-800/80">
        <div className="h-[90vh] w-full">
          <div className="flex items-center justify-between p-2">
            <LogoComponentLarge />
            {/* <p className="hidden font-semibold text-zinc-200 sm:text-3xl md:block">
            War Manager
          </p> */}
            <div className="flex items-center gap-3">
              <SignedIn>
                <Link href="/dashboard">
                  <div className="cursor-pointer rounded p-2 font-semibold transition-all duration-100 hover:text-amber-500">
                    Dashboard
                  </div>
                </Link>
                <UserButton />
              </SignedIn>
            </div>

            <SignedOut>
              <SignInButton redirectUrl="/dashboard">
                <div className="cursor-pointer rounded p-2 font-semibold transition-all duration-100 hover:text-amber-500">
                  Sign In
                </div>
              </SignInButton>
            </SignedOut>
          </div>
          <div className="m-auto flex h-[90vh] w-4/5 flex-col items-start justify-center gap-10 sm:w-1/2">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-[3rem] lg:text-[4rem] xl:text-[6rem]">
              Construction Management is{" "}
              <span className="bg-gradient-to-br from-amber-400 to-red-700 bg-clip-text text-transparent">
                Hard Work
              </span>
            </h1>
            <p className="text-zinc-300 sm:text-3xl">
              War Manager enables you to stay organized and keep your team on
              the same page.
            </p>
            <div className="flex w-full items-end justify-between gap-4">
              <div>
                {/* <p>Sign in</p> */}
                <SignInButton redirectUrl="/dashboard" mode="modal">
                  <div className="flex w-32 cursor-pointer items-center justify-center gap-2  rounded bg-gradient-to-br from-amber-600 to-red-700 p-2 text-center font-semibold hover:scale-105">
                    Sign In
                    <ArrowRightIcon className="inline h-5 w-5" />
                  </div>
                </SignInButton>
              </div>
              <div>
                <p>{"Don't have an account?"}</p>
                <SignUpButton redirectUrl="/dashboard" mode="modal">
                  <div className="flex w-32 cursor-pointer items-center justify-center gap-2 rounded border border-zinc-400 bg-zinc-600 p-2 text-center font-semibold hover:scale-105">
                    Sign Up
                    <ArrowRightIcon className="inline h-5 w-5" />
                  </div>
                </SignUpButton>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[50vh] border-t border-zinc-700 bg-zinc-900 bg-center p-2">
          <h2 className="border-b border-zinc-700 py-1 text-3xl font-bold tracking-tight text-white sm:py-3 sm:text-4xl lg:py-5 lg:text-[2rem] xl:text-[3rem]">
            Features
          </h2>
          <div className="flex flex-col gap-4 py-5 text-lg font-semibold text-zinc-300">
            <p>
              {">"}{" "}
              {"Create and send visual labor 'Blueprint' plans with ease."}
            </p>
            <p>
              {" "}
              {">"} Coordinate illustrated crew skills with project
              requirements.
            </p>
            <p>
              {">"} Up to date employee contacts, and relavent job information
              on your mobile device.
            </p>
            <p>{">"} Easily download reports to Excel or Google sheets.</p>
            <p> {">"} Enhanced communication between field and office teams.</p>
          </div>
          {/* <SignUpButton redirectUrl="/dashboard" mode="modal">
          <div className="cursor-pointer rounded bg-gradient-to-br from-amber-600 to-red-700 p-2 font-semibold hover:scale-105">
            Sign Up
          </div>
        </SignUpButton> */}
        </div>
      </main>
    </>
  );
};

export default HomePage;
