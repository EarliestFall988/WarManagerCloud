import Image from "next/image";

export const LogoComponent = (props: {context?: string }) => {
  return (
    <div className="flex items-center justify-start gap-1">
      <Image src="/static/logo.png" width={24} height={24} alt="war manager logo" className="translate-x-[2px]" />
      <h1 className="text-sm sm:hidden lg:block lg:text-lg">
        {props.context}
      </h1>
    </div>
  );
};

export const LogoComponentLarge = (props: {context?: string }) => {
    return (
      <div className="flex items-center justify-start gap-1">
        <Image src="/static/logo.png" width={48} height={48} alt="war manager logo" className="translate-x-[2px]" />
        <h1 className="text-sm sm:hidden lg:block lg:text-lg">
          {props.context}
        </h1>
      </div>
    );
  };
