import { SignInButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const SignInModal = (props: { redirectUrl: string }) => {
  return (
    <>
      <div className="absolute top-0 h-screen w-screen bg-bhall bg-center" />
      <div className="absolute top-0 flex flex-col h-screen w-screen text-center justify-between overflow-hidden">
        <div className="flex md:hidden"/>
        <div className="flex flex-col justify-center items-center gap-2 bg-black/80 backdrop-blur-sm border-y-8 md:border-y-0 md:border-r-8 border-red-700 p-3 shadow-lg h-2/5 md:w-1/2 xl:w-1/3 2xl:w-1/4 md:h-full duration-100 transition-all">
          <h1 className="text-3xl font-bold text-gray-100 lg:text-[2em]" >
            {"You are not signed in"}
          </h1>
          <div className="flex w-full flex-col items-center p-4 ">
            <SignInButton redirectUrl={props.redirectUrl} mode="modal">
              <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gradient-to-l from-amber-600 to-red-800 p-2 text-xl font-semibold shadow-lg transition-all duration-100 hover:scale-105 lg:w-1/3">
                <p>Sign in</p>
                <ArrowRightIcon className="h-6 w-6 " />
              </div>
            </SignInButton>
          </div>
          {/* <div className="flex w-full flex-col items-center justify-center lg:flex-row">
              <p className="p-1 text-sm text-zinc-200">
                {" or, if you haven't used your a valid '@jrcousa.com' email"}
              </p>
              <SignUpButton>
                <p className="cursor-pointer text-amber-600 hover:text-amber-500">
                  Sign Up
                </p>
              </SignUpButton>
            </div> */}
        </div>
        {/* <div className="bg-bhall bg-center w-2/3 h-screen" /> */}
        <div className="w-full p-1 text-center text-xs text-white bg-zinc-900 lg:text-sm">
          Roof of Bartle Hall in Kansas City - copyright &copy;{" "}
          {new Date().getFullYear()} JR&Co Roofing Contractors LLC.
        </div>
      </div>
    </>
  );
};

export default SignInModal;
