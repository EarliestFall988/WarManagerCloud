import { useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { NextPage } from "next";
import Image from "next/image";
import { LoadingPage2, SKCubeSpinner } from "~/components/loading";
import SettingsLayout from "~/components/settingsSideMenu";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const UsersSettingsPage: NextPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  const { data, isError, isLoading } = api.users.getAllUsers.useQuery();

  const [animationParent] = useAutoAnimate();

  const testSession = () => {
    console.log("test session");

    void fetch("/api/cron-jobs/usage")
      .then((res) => res.text())
      .then((data) => console.log(data));
  };

  if (isError) {
    return (
      <SettingsLayout>
        <div className="flex h-[30vh] items-center justify-center text-2xl font-semibold tracking-tight text-zinc-500">
          <p>Error loading users</p>
        </div>
      </SettingsLayout>
    );
  }

  const convertToTime = (date: number) => {
    if (date === 0) return "Never";

    const dateObject = new Date(date);
    return dateObject.toDateString();
  };

  if (!isLoaded) {
    return <LoadingPage2 />;
  }

  if (!isSignedIn) {
    return <SignInModal redirectUrl="/settings/permissions" />;
  }

  if (isError) {
    return (
      <SettingsLayout>
        <div className="flex h-[30vh] items-center justify-center text-2xl font-semibold tracking-tight text-zinc-500">
          <p>Error loading permissions</p>
        </div>
      </SettingsLayout>
    );
  }

  if (
    user?.emailAddresses == undefined ||
    user?.emailAddresses[0] == undefined ||
    (user?.emailAddresses[0].emailAddress !== "andrew.kaiser@jrcousa.com" &&
      user?.emailAddresses[0].emailAddress !== "taylor.howell@jrcousa.com")
  ) {
    return (
      <SettingsLayout>
        <div className="flex h-[30vh] items-center justify-center text-xl font-semibold tracking-tight text-zinc-300">
          <p>You do not have permission to view this page</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div ref={animationParent} className="min-h-[50vh]">
        {isLoading && (
          <div className="flex h-[30vh] items-center justify-center font-semibold tracking-tight">
            <SKCubeSpinner />
          </div>
        )}
        {data?.map((user) => (
          <div
            key={user.User.id}
            className="mb-2 flex items-center justify-between border-b border-zinc-700 p-2 text-left"
          >
            <div className="flex items-center gap-2 p-1">
              <Image
                src={user.User.profileImageUrl}
                width={50}
                height={50}
                className="rounded-full"
                alt={`${user.User.firstName || ""} ${
                  user.User.lastName || ""
                }'s profile picture`}
              />
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-zinc-200">
                  {user.User.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-sm text-zinc-400">
                  {user.User.firstName} {user.User.lastName}
                </p>
                <p className="block text-sm text-zinc-300 md:hidden">
                  <span className="text-xs text-zinc-500">Last Signed In:</span>{" "}
                  {convertToTime(user.User.lastSignInAt || 0)}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-zinc-300">
                <span className="text-xs text-zinc-500">Last Signed In:</span>{" "}
                {convertToTime(user.User.lastSignInAt || 0)}
              </p>
            </div>
          </div>
        ))}
        <div>
          <button
            onClick={testSession}
            className="w-1/3 rounded border border-amber-700 p-1 text-center"
          >
            Check last logged in
          </button>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default UsersSettingsPage;
