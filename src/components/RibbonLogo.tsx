import Image from "next/image";

export const LogoComponent = (props: {context?: string }) => {
  return (
    <div className="flex items-center justify-start gap-1">
      <Image src="/favicon.ico" width={24} height={24} alt="war manager logo" />
      <h1 className="text-sm sm:hidden lg:block lg:text-lg">
        {props.context}
      </h1>
    </div>
  );
};

export const LogoComponentLarge = (props: {context?: string }) => {
    return (
      <div className="flex items-center justify-start gap-1">
        <Image src="/favicon.ico" width={48} height={48} alt="war manager logo" />
        <h1 className="text-sm sm:hidden lg:block lg:text-lg">
          {props.context}
        </h1>
      </div>
    );
  };
