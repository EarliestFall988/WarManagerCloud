import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const SignInModal = (props: { redirectUrl: string }) => {
  return (
    <>
      <div className="absolute -z-10 h-screen w-screen bg-bhall"></div>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black/50 bg-clip-padding bg-center bg-origin-content p-2 text-center backdrop-blur-sm backdrop-brightness-50">
        <h1 className="text-3xl font-bold text-gray-100">
          You are not signed in
        </h1>
        <SignInButton redirectUrl={props.redirectUrl}>
          <div className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-gradient-to-l from-amber-700 to-red-700 p-2 text-xl font-semibold shadow-lg transition-all duration-100 hover:scale-105 sm:w-1/2 lg:w-1/6">
            <p>Sign in</p>
            <ArrowRightIcon className="h-6 w-6 " />
          </div>
        </SignInButton>
        <p className="pt-20 italic text-zinc-300">or sign up...</p>
        <SignUpButton>
          <div className=" mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-zinc-500 p-2 text-xl font-semibold shadow-lg transition-all duration-100 hover:scale-105 sm:w-1/2 lg:w-1/6">
            <p>Sign Up</p>
            <ArrowRightIcon className="h-6 w-6 " />
          </div>
        </SignUpButton>
      </div>
    </>
  );
};

export default SignInModal;
