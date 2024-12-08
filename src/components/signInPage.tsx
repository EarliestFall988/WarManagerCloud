import { SignIn } from "@clerk/nextjs";

const SignInModal = (props: { redirectUrl?: string }) => {
  return (
    <>
      <div className="absolute top-0 h-screen w-screen bg-bhall bg-left-bottom md:bg-left-top brightness-110 saturate-150" />
      <div className="absolute top-0 flex flex-col h-screen w-screen text-center justify-between overflow-hidden">
        <div className="flex md:hidden" />
        <div className="flex flex-col justify-center items-center gap-2 bg-black/90 md:bg-black h-full p-3 shadow-lg md:w-1/2 xl:w-1/3 md:h-full duration-100 transition-all">
          {/* <h1 className="text-3xl font-bold text-gray-100 lg:text-[2em]" >
            {"You are not signed in"}
          </h1> */}
          <div className="flex w-full flex-col justify-center items-center p-4 ">
            {/* <SignInButton redirectUrl={props.redirectUrl} mode="modal">
              <div className="flex w-48 cursor-pointer items-center justify-center gap-2 rounded bg-gradient-to-l from-amber-600 to-red-800 p-2 text-xl font-semibold shadow-lg transition-all duration-100 hover:scale-105 ">
                <p>Sign in</p>
                <ArrowRightIcon className="h-6 w-6 " />
              </div>
            </SignInButton> */}

            <SignIn redirectUrl={props.redirectUrl || "/dashboard/activity"} appearance={{
              elements: {
                card: "bg-transparent shadow-sm",
                logoBox: "bg-transparent",
                formButtonPrimary: "bg-gradient-to-r from-amber-600 to-red-800 text-white font-semibold shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-100",
                formFieldAction: "text-amber-600 hover:text-amber-500 font-semibold transition-all duration-100",
                footerActionLink: "text-amber-600 hover:text-amber-500 font-semibold transition-all duration-100",
              }
            }} />

          </div>
        </div>
        {/* <div className="flex md:hidden" /> */}
      </div>
    </>
  );
};

export default SignInModal;
