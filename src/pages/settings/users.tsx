import { NextPage } from "next";
import Image from "next/image";
import { SKCubeSpinner } from "~/components/loading";
import SettingsLayout from "~/components/settingsSideMenu";
import { api } from "~/utils/api";


const UsersSettingsPage: NextPage = () => {

    const { data, isError, isLoading } = api.users.getAllUsers.useQuery();

    if (isError) {
        return (
            <SettingsLayout>
                <div className="h-[30vh] flex items-center text-2xl text-zinc-500 font-semibold tracking-tight justify-center">
                    <p>Error loading users</p>
                </div>
            </SettingsLayout>
        )
    }

    const convertToTime = (date: number) => {

        if (date === 0) return ("Never");

        const dateObject = new Date(date);
        return dateObject.toDateString();
    }

    return (
        <SettingsLayout>
            <div className="min-h-[50vh]">
                {isLoading && (
                    <div className="h-[30vh] flex items-center font-semibold tracking-tight justify-center">
                        <SKCubeSpinner />
                    </div>
                )}
                {
                    data?.map((user) => (
                        <div key={user.User.id} className="text-left flex items-center justify-between border-zinc-700 border-b p-2 mb-2">
                            <div className="flex p-1 gap-2 items-center">
                                <Image src={user.User.profileImageUrl} width={50} height={50} className="rounded-full" alt={`${user.User.firstName} ${user.User.lastName}'s profile picture`} />
                                <div className="flex flex-col">
                                    <p className="text-lg text-zinc-200 font-semibold">{user.User.emailAddresses[0]?.emailAddress}</p>
                                    <p className="text-sm text-zinc-400">{user.User.firstName} {user.User.lastName}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-300"><span className="text-xs text-zinc-500">Last Signed In:</span> {convertToTime(user.User.lastSignInAt || 0)}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </SettingsLayout>
    )
}

export default UsersSettingsPage;