import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const SignInModal = (props: { redirectUrl: string }) => {
  return (
    <>
      <div className="absolute top-0 h-screen w-screen bg-bhall bg-center" />
      <div className="absolute top-0 flex h-screen w-screen items-start gap-5 bg-clip-padding bg-center bg-origin-content p-2 text-center backdrop-brightness-75 backdrop-contrast-125 backdrop-saturate-150">
        <div className="flex h-3/6 items-center justify-center lg:w-2/5">
          <div className="flex flex-col justify-center items-center gap-2 rounded border border-zinc-600 bg-zinc-800 p-3 shadow-lg lg:w-3/4 lg:h-3/5">
            <h1 className="text-3xl font-bold text-gray-100 lg:text-[2em]">
              {"You are not signed in :( "}
            </h1>

            <div className="flex w-full flex-col items-center p-4">
              <SignInButton redirectUrl={props.redirectUrl}>
                <div className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gradient-to-l from-amber-700 to-red-700 p-2 text-xl font-semibold shadow-lg transition-all duration-100 hover:scale-105 lg:w-1/2">
                  <p>Sign in</p>
                  <ArrowRightIcon className="h-6 w-6 " />
                </div>
              </SignInButton>
            </div>
            <div className="flex w-full flex-col items-center justify-center lg:flex-row">
              <p className="p-1 text-sm text-zinc-200">
                {" or, if you haven't used your a valid '@jrcousa.com' email"}
              </p>
              <SignUpButton>
                <p className="cursor-pointer text-amber-600 hover:text-amber-500">
                  Sign Up
                </p>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-1 text-center text-xs text-zinc-800 lg:text-sm">
        Roof of Bartle Hall in Kansas City - copyright &copy;{" "}
        {new Date().getFullYear()} JR&Co Roofing Contractors LLC.
      </div>
    </>
  );
};

export default SignInModal;
