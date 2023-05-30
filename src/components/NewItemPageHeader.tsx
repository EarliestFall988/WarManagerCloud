import Link from "next/link";

export const NewItemPageHeader = (props: {
  title: string;
  context: string | undefined;
}) => {
  return (
    <div className="flex items-center justify-between bg-zinc-700 p-2 text-center text-lg font-semibold">
      {props.context == "blueprints" && (
        <Link href="/dashboard?context=Blueprints" className="w-12 ">
          {"Back"}
        </Link>
      )}
      {props.context == "projects" && (
        <Link href="/dashboard?context=Projects" className="w-12 ">
          {"Back"}
        </Link>
      )}
      {props.context == "crewmembers" && (
        <Link href="/dashboard?context=CrewMembers" className="w-12 ">
          {"Back"}
        </Link>
      )}
      <h1 className="text-[1rem] sm:text-lg">{props.title}</h1>{" "}
      <div className="hidden w-12 sm:flex" />
    </div>
  );
};
