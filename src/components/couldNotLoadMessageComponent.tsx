import { SignalSlashIcon } from "@heroicons/react/24/solid";

export const CouldNotLoadMessageComponent: React.FC<{ pluralName: string }> = ({
  pluralName,
}) => {
  return (
    <div className="flex p-2 h-[80vh] sm:h-[30vh] w-full select-none flex-col items-center justify-center rounded-lg px-2">
      <SignalSlashIcon className="h-8 lg:hidden w-8 animate-pulse text-red-500" />
      <div className="flex items-center justify-center gap-2 text-lg">
        <SignalSlashIcon className="h-8 hidden lg:block w-8 translate-y-1 animate-pulse text-red-500" />
        <p className="text-3xl font-semibold text-center lg:text-left text-red-500">
          War Manager could not load {pluralName}.
        </p>
      </div>
      <p>Check your internet connection.</p>
    </div>
  );
};
